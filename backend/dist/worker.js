"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const inference_1 = require("@huggingface/inference");
const prisma_1 = require("./lib/prisma");
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
    const categoryNames = categories.map(cat => cat.name);
    if (categoryNames.length === 0) {
        console.warn('No categories defined. Skipping classification.');
        return;
    }
    // Perform zero-shot classification
    const classificationResult = await hf.zeroShotClassification({
        model: 'facebook/bart-large-mnli',
        inputs: email.body || email.subject || '',
        parameters: { candidate_labels: categoryNames },
    });
    // Find the best matching category
    const bestCategory = classificationResult.result.labels[0];
    const bestCategoryScore = classificationResult.result.scores[0];
    // Find the category ID based on the best matching category name
    const classifiedCategory = categories.find(cat => cat.name === bestCategory);
    if (classifiedCategory) {
        await prisma_1.prisma.email.update({
            where: {
                id: email.id,
            },
            data: {
                categoryId: classifiedCategory.id,
            },
        });
        console.log(`Email ${email.id} classified as: ${bestCategory} (score: ${bestCategoryScore})`);
    }
    else {
        console.warn(`Could not find category ID for ${bestCategory}. Email ${email.id} remains unclassified.`);
    }
}, {
    connection: {
        host: 'localhost',
        port: 6379,
    },
});
console.log('Email processing worker started.');
