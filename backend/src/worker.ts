import { Worker } from 'bullmq';
import { HfInference } from '@huggingface/inference';
import { prisma } from './lib/prisma';

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
  const bestCategory = classificationResult.labels[0];
  const bestCategoryScore = classificationResult.scores[0];

  // Find the category ID based on the best matching category name
  const classifiedCategory = categories.find(cat => cat.name === bestCategory);

  if (classifiedCategory) {
    await prisma.email.update({
      where: {
        id: email.id,
      },
      data: {
        categoryId: classifiedCategory.id,
      },
    });
    console.log(`Email ${email.id} classified as: ${bestCategory} (score: ${bestCategoryScore})`);
  } else {
    console.warn(`Could not find category ID for ${bestCategory}. Email ${email.id} remains unclassified.`);
  }
}, {
  connection: {
    host: 'localhost',
    port: 6379,
  },
});

console.log('Email processing worker started.');
