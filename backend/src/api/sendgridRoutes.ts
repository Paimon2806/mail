import express, { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { queue } from '../lib/queue';

const router = express.Router();

router.post('/sendgrid', async (req: Request, res: Response) => {
  const { messageId, subject, from, text } = req.body;

  if (!messageId) {
    return res.status(400).json({ error: 'Bad Request: messageId is missing' });
  }

  const email = await prisma.email.create({
    data: {
      sendgridMessageId: messageId,
      subject,
      from,
      body: text,
    },
  });

  await queue.add('process-email', { emailId: email.id });

  res.status(200).json({ message: 'Email received and queued for processing.' });
});

export { router as sendgridRoutes };
