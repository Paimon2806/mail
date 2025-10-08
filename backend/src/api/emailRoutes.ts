import express, { Request, Response } from 'express';
import { emailService } from '../services/emailService';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  if (Object.keys(req.query).length > 0) {
    return res.status(400).json({ error: 'Bad Request: No query parameters are supported for this endpoint.' });
  }

  try {
    const emails = await emailService.getAllEmails();
    res.json(emails);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export { router as emailRoutes };
