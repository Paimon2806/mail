import { Worker } from 'bullmq';
import { HfInference } from '@huggingface/inference';
import { prisma } from './lib/prisma';
import { emailService } from '../services/emailService'; // Import emailService

// Define a local interface for Category based on data-model.md
interface Category {
  id: number;
  name: string;
  parentId: number | null;
}

const hf = new HfInference(process.env.HUGGING_FACE_API_TOKEN);

const worker = new Worker('email-processing', async job => {
  const { emailId } = job.data;

  const email = await prisma.email.findUnique({
    where: {
      id: emailId,
    },
  });

  if (!email) {
    console.error(`Email with ID ${emailId} not found.`);
    return;
  }

  // Fetch categories from the database
  const categories = await prisma.category.findMany();
  const categoryNames = categories.map((cat: Category) => cat.name);

  if (categoryNames.length === 0) {
    console.warn('No categories defined. Skipping classification.');
    // If no categories are defined, try to find or create an 'Unclassified' category
    let unclassifiedCategory = await prisma.category.findUnique({
      where: { name: 'Unclassified' },
    });

    if (!unclassifiedCategory) {
      unclassifiedCategory = await prisma.category.create({
        data: { name: 'Unclassified' },
      });
    }
    await emailService.updateEmailCategory(email.id, unclassifiedCategory.id);
    return;
  }

  // Perform zero-shot classification
  const classificationResult: any = await hf.zeroShotClassification({
    model: 'facebook/bart-large-mnli',
    inputs: email.body || email.subject || '',
    parameters: { candidate_labels: categoryNames },
  });

  // Find the best matching category
  const bestCategory = classificationResult.labels[0];
  const classifiedCategory = categories.find((cat: Category) => cat.name === bestCategory);

  let targetCategoryId: number | null = null;

  if (classifiedCategory) {
    targetCategoryId = classifiedCategory.id;
  } else {
    // If no matching category found, try to find or create an 'Unclassified' category
    let unclassifiedCategory = await prisma.category.findUnique({
      where: { name: 'Unclassified' },
    });

    if (!unclassifiedCategory) {
      unclassifiedCategory = await prisma.category.create({
        data: { name: 'Unclassified' },
      });
    }
    targetCategoryId = unclassifiedCategory.id;
  }

  if (targetCategoryId !== null) {
    await emailService.updateEmailCategory(email.id, targetCategoryId);
    console.log(`Email ${email.id} classified as: ${bestCategory || 'Unclassified'} (score: ${classificationResult.scores[0] || 'N/A'})`);
  } else {
    console.warn(`Could not classify email ${email.id} and no 'Unclassified' category found.`);
  }
}, {
  connection: {
    host: 'localhost',
    port: 6379,
  },
});

console.log('Email processing worker started.');