import express, { Request, Response } from 'express';
import { emailService } from '../services/emailService';
import { queue } from '../lib/queue';

const router = express.Router();

router.post('/sendgrid', async (req: Request, res: Response) => {
  const { messageId, subject, from, text } = req.body;

  if (!messageId || typeof messageId !== 'string' || messageId.trim() === '') {
    return res.status(400).json({ error: 'Bad Request: messageId is required and must be a non-empty string.' });
  }

  if (!from || typeof from !== 'string' || from.trim() === '') {
    return res.status(400).json({ error: 'Bad Request: from is required and must be a non-empty string.' });
  }

  if (subject !== undefined && (typeof subject !== 'string')) {
    return res.status(400).json({ error: 'Bad Request: subject must be a string.' });
  }

  if (text !== undefined && (typeof text !== 'string')) {
    return res.status(400).json({ error: 'Bad Request: text must be a string.' });
  }

  try {
    const email = await emailService.createEmail(messageId, from, subject, text);
    await queue.add('process-email', { emailId: email.id });
    res.status(200).json({ message: 'Email received and queued for processing.' });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export { router as sendgridRoutes };
