"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const inference_1 = require("@huggingface/inference");
const prisma_1 = require("./lib/prisma");
const emailService_1 = require("../services/emailService"); // Import emailService
const hf = new inference_1.HfInference(process.env.HUGGING_FACE_API_TOKEN);
const worker = new bullmq_1.Worker('email-processing', async (job) => {
    const { emailId } = job.data;
    const email = await prisma_1.prisma.email.findUnique({
        where: {
            id: emailId,
        },
    });
    if (!email) {
        console.error(`Email with ID ${emailId} not found.`);
        return;
    }
    // Fetch categories from the database
    const categories = await prisma_1.prisma.category.findMany();
    const categoryNames = categories.map((cat) => cat.name);
    if (categoryNames.length === 0) {
        console.warn('No categories defined. Skipping classification.');
        // If no categories are defined, try to find or create an 'Unclassified' category
        let unclassifiedCategory = await prisma_1.prisma.category.findUnique({
            where: { name: 'Unclassified' },
        });
        if (!unclassifiedCategory) {
            unclassifiedCategory = await prisma_1.prisma.category.create({
                data: { name: 'Unclassified' },
            });
        }
        await emailService_1.emailService.updateEmailCategory(email.id, unclassifiedCategory.id);
        return;
    }
    // Perform zero-shot classification
    const classificationResult = await hf.zeroShotClassification({
        model: 'facebook/bart-large-mnli',
        inputs: email.body || email.subject || '',
        parameters: { candidate_labels: categoryNames },
    });
    // Find the best matching category
    const bestCategory = classificationResult.labels[0];
    const classifiedCategory = categories.find((cat) => cat.name === bestCategory);
    let targetCategoryId = null;
    if (classifiedCategory) {
        targetCategoryId = classifiedCategory.id;
    }
    else {
        // If no matching category found, try to find or create an 'Unclassified' category
        let unclassifiedCategory = await prisma_1.prisma.category.findUnique({
            where: { name: 'Unclassified' },
        });
        if (!unclassifiedCategory) {
            unclassifiedCategory = await prisma_1.prisma.category.create({
                data: { name: 'Unclassified' },
            });
        }
        targetCategoryId = unclassifiedCategory.id;
    }
    if (targetCategoryId !== null) {
        await emailService_1.emailService.updateEmailCategory(email.id, targetCategoryId);
        console.log(`Email ${email.id} classified as: ${bestCategory || 'Unclassified'} (score: ${classificationResult.scores[0] || 'N/A'})`);
    }
    else {
        console.warn(`Could not classify email ${email.id} and no 'Unclassified' category found.`);
    }
}, {
    connection: {
        host: 'localhost',
        port: 6379,
    },
});
console.log('Email processing worker started.');
