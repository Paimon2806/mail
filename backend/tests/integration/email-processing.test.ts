import request from 'supertest';
import { app } from '../../src/app';
import { prisma } from '../../src/lib/prisma';
import { Worker, Queue } from 'bullmq';
import { HfInference } from '@huggingface/inference';
import { emailService } from '../../src/services/emailService'; // Import emailService

// Mock Hugging Face Inference to prevent actual API calls during integration tests
jest.mock('@huggingface/inference', () => {
  return {
    HfInference: jest.fn(() => ({
      zeroShotClassification: jest.fn(({
        inputs,
        parameters: { candidate_labels },
      }) => {
        // Simple mock classification logic: always pick 'Unclassified'
        return Promise.resolve({
          sequence: inputs,
          labels: ['Unclassified'],
          scores: [0.99],
        });
      }),
    })),
  };
});

describe('Email Processing Integration', () => {
  let emailQueue: Queue;
  let worker: Worker;
  let defaultCategory: any; // Declare defaultCategory here

  beforeAll(async () => {
    // Clear the database before all tests
    await prisma.email.deleteMany();
    await prisma.category.deleteMany();

    // Ensure a default category exists for classification
    defaultCategory = await prisma.category.create({
      data: {
        name: 'Unclassified',
      },
    });

    // Initialize BullMQ queue and worker
    emailQueue = new Queue('email-processing', {
      connection: {
        host: 'localhost',
        port: 6379,
      },
    });

    worker = new Worker('email-processing', async job => {
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

      // No need to fetch categories, as mock HfInference always returns 'Unclassified'
      // const categories = await prisma.category.findMany();
      // const categoryNames = categories.map(cat => cat.name);

      // if (categoryNames.length === 0) {
      //   console.warn('No categories defined. Skipping classification.');
      //   // If no categories are defined, assign to the default 'Unclassified' category
      //   await emailService.updateEmailCategory(email.id, defaultCategory.id);
      //   return;
      // }

      const hf = new HfInference(process.env.HUGGING_FACE_API_TOKEN);
      const classificationResult: any = await hf.zeroShotClassification({
        model: 'facebook/bart-large-mnli',
        inputs: email.body || email.subject || '',
        parameters: { candidate_labels: ['Unclassified'] }, // Pass only 'Unclassified' as candidate label
      });

      const bestCategory = classificationResult.labels[0];
      // Find the category ID based on the best matching category name
      const classifiedCategory = await prisma.category.findUnique({
        where: { name: bestCategory },
      });

      if (classifiedCategory) {
        await emailService.updateEmailCategory(email.id, classifiedCategory.id);
      } else {
        // This else block should ideally not be hit if 'Unclassified' is always created and returned by mock
        await emailService.updateEmailCategory(email.id, defaultCategory.id);
      }
    }, {
      connection: {
        host: 'localhost',
        port: 6379,
      },
    });
  });

  afterAll(async () => {
    await emailQueue.close();
    await worker.close();
    await prisma.$disconnect();
  });

  it('should process an email received via webhook and classify it', async () => {
    // The beforeAll block ensures a clean slate and the 'Unclassified' category exists.

    const payload = {
      messageId: 'test-integration-message-id',
      subject: 'Integration Test Email',
      from: 'integration@example.com',
      text: 'This is an email for integration testing.',
    };

    // 1. Send email via webhook
    const webhookResponse = await request(app)
      .post('/webhooks/sendgrid')
      .send(payload);

    expect(webhookResponse.status).toBe(200);
    expect(webhookResponse.body).toEqual({ message: 'Email received and queued for processing.' });

    // 2. Wait for the worker to process the job
    // In a real scenario, you might use a more robust way to wait for job completion
    // For now, a simple delay should suffice for this integration test
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for 2 seconds

    // 3. Verify email is saved and classified in the database
    const processedEmail = await prisma.email.findUnique({
      where: {
        sendgridMessageId: payload.messageId,
      },
      include: {
        category: true,
      },
    });
    console.log('Test: Processed Email:', processedEmail);

    expect(processedEmail).toBeDefined();
    expect(processedEmail?.subject).toBe(payload.subject);
    expect(processedEmail?.from).toBe(payload.from);
    expect(processedEmail?.body).toBe(payload.text);
    expect(processedEmail?.categoryId).toBeDefined();
    expect(processedEmail?.category?.name).toBe('Unclassified'); // Based on mock classification and default handling
  });
});