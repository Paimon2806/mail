import express, { Request, Response } from 'express';
import { categoryService } from '../services/categoryService';
import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  const categories = await categoryService.getAllCategories();
  res.json(categories);
});

router.post('/', async (req: Request, res: Response) => {
  const { name, parentId } = req.body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'Bad Request: name is required and must be a non-empty string.' });
  }

  if (parentId !== undefined && parentId !== null && typeof parentId !== 'number') {
    return res.status(400).json({ error: 'Bad Request: parentId must be a number or null.' });
  }

  try {
    const category = await categoryService.createCategory(name, parentId);
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, parentId } = req.body;

  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ error: 'Bad Request: ID must be a valid number.' });
  }

  if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
    return res.status(400).json({ error: 'Bad Request: name must be a non-empty string if provided.' });
  }

  if (parentId !== undefined && parentId !== null && typeof parentId !== 'number') {
    return res.status(400).json({ error: 'Bad Request: parentId must be a number or null if provided.' });
  }

  if (name === undefined && parentId === undefined) {
    return res.status(400).json({ error: 'Bad Request: At least one field (name or parentId) must be provided for update.' });
  }

  try {
    const updatedCategory = await categoryService.updateCategory(Number(id), name, parentId);
    res.status(200).json(updatedCategory);
  } catch (error: any) {
    if (error.message === 'Category not found') {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ error: 'Bad Request: ID must be a valid number.' });
  }

  try {
    await categoryService.deleteCategory(Number(id));
    res.status(204).send();
  } catch (error: any) {
    if (error.message === 'Category not found') {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export { router as categoryRoutes };
