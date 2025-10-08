import request from 'supertest';
import { app } from '../../src/app';
import { prisma } from '../../src/lib/prisma';
import { Prisma } from '@prisma/client';

jest.mock('../../src/lib/prisma', () => ({
  prisma: {
    category: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('Category Routes', () => {
  it('should respond with a 404 for a non-existent route', async () => {
    const response = await request(app).get('/non-existent-route');
    expect(response.status).toBe(404);
  });

  describe('GET /categories', () => {
    it('should return an empty array when no categories exist', async () => {
      (prisma.category.findMany as jest.Mock).mockResolvedValue([]);
      const response = await request(app).get('/categories');
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe('POST /categories', () => {
    it('should create a new category and return it', async () => {
      const newCategory = { name: 'Test Category' };
      const createdCategory = { id: 1, ...newCategory };
      (prisma.category.create as jest.Mock).mockResolvedValue(createdCategory);

      const response = await request(app)
        .post('/categories')
        .send(newCategory);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject(newCategory);
      expect(response.body.id).toBeDefined();
    });

    it('should return 400 for a missing name', async () => {
        const response = await request(app)
            .post('/categories')
            .send({});

        expect(response.status).toBe(400);
    });
  });

  describe('PUT /categories/:id', () => {
    it('should update an existing category and return it', async () => {
      const updatedCategory = { id: 1, name: 'Updated Category' };
      (prisma.category.update as jest.Mock).mockResolvedValue(updatedCategory);

      const response = await request(app)
        .put('/categories/1')
        .send({ name: 'Updated Category' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedCategory);
    });

    it('should return 404 if category to update does not exist', async () => {
      (prisma.category.update as jest.Mock).mockRejectedValue(new Prisma.PrismaClientKnownRequestError('Record to update not found', { code: 'P2025', clientVersion: '2.20.1' })); // Simulate Prisma not found error

      const response = await request(app)
        .put('/categories/999')
        .send({ name: 'Non Existent Category' });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /categories/:id', () => {
    it('should delete an existing category', async () => {
      (prisma.category.delete as jest.Mock).mockResolvedValue({ id: 1 });

      const response = await request(app).delete('/categories/1');

      expect(response.status).toBe(204);
      expect(response.body).toEqual({});
    });

    it('should return 404 if category to delete does not exist', async () => {
      (prisma.category.delete as jest.Mock).mockRejectedValue(new Prisma.PrismaClientKnownRequestError('Record to delete not found', { code: 'P2025', clientVersion: '2.20.1' })); // Simulate Prisma not found error

      const response = await request(app).delete('/categories/999');

      expect(response.status).toBe(404);
    });
  });
});
