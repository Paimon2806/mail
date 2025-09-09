import request from 'supertest';
import { app } from '../../src/app';
import { prisma } from '../../src/lib/prisma';

describe('Category Management Integration', () => {
  beforeAll(async () => {
    await prisma.email.deleteMany();
    await prisma.category.deleteMany();
  });

  beforeEach(async () => {
    // Clear categories before each test
    await prisma.category.deleteMany();
  });

  it('should create a new category', async () => {
    const newCategory = { name: 'Integration Category' };
    const response = await request(app)
      .post('/categories')
      .send(newCategory);

    expect(response.status).toBe(201);
    expect(response.body.name).toBe(newCategory.name);

    const categoryInDb = await prisma.category.findUnique({
      where: { id: response.body.id },
    });
    expect(categoryInDb).toBeDefined();
    expect(categoryInDb?.name).toBe(newCategory.name);
  });

  it('should retrieve all categories', async () => {
    await prisma.category.createMany({
      data: [{ name: 'Category 1' }, { name: 'Category 2' }],
    });

    const response = await request(app).get('/categories');

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
    expect(response.body[0].name).toBe('Category 1');
    expect(response.body[1].name).toBe('Category 2');
  });

  it('should update an existing category', async () => {
    const createdCategory = await prisma.category.create({ data: { name: 'Original Category' } });
    const updatedName = 'Updated Integration Category';

    const response = await request(app)
      .put(`/categories/${createdCategory.id}`)
      .send({ name: updatedName });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe(updatedName);

    const categoryInDb = await prisma.category.findUnique({
      where: { id: createdCategory.id },
    });
    expect(categoryInDb?.name).toBe(updatedName);
  });

  it('should delete an existing category', async () => {
    const createdCategory = await prisma.category.create({ data: { name: 'Category to Delete' } });

    const response = await request(app).delete(`/categories/${createdCategory.id}`);

    expect(response.status).toBe(204);

    const categoryInDb = await prisma.category.findUnique({
      where: { id: createdCategory.id },
    });
    expect(categoryInDb).toBeNull();
  });

  it('should return 404 when trying to update a non-existent category', async () => {
    const response = await request(app)
      .put('/categories/999')
      .send({ name: 'Non Existent' });

    expect(response.status).toBe(404);
  });

  it('should return 404 when trying to delete a non-existent category', async () => {
    const response = await request(app).delete('/categories/999');

    expect(response.status).toBe(404);
  });
});
