import request from 'supertest';
import { app } from '../../src/app';
import { prisma } from '../../src/lib/prisma';

jest.mock('../../src/lib/prisma', () => ({
  prisma: {
    category: {
      findMany: jest.fn(),
      create: jest.fn(),
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
});
