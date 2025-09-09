import express, { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  const categories = await prisma.category.findMany();
  res.json(categories);
});

router.post('/', async (req: Request, res: Response) => {
  const { name, parentId } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Bad Request: name is missing' });
  }

  const category = await prisma.category.create({
    data: {
      name,
      parentId,
    },
  });

  res.status(201).json(category);
});

export { router as categoryRoutes };
