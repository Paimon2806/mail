import { categoryService } from '../../src/services/categoryService';
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

describe('Category Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllCategories', () => {
    it('should return all categories', async () => {
      const mockCategories = [{ id: 1, name: 'Category 1', parentId: null }];
      (prisma.category.findMany as jest.Mock).mockResolvedValue(mockCategories);

      const categories = await categoryService.getAllCategories();
      expect(categories).toEqual(mockCategories);
      expect(prisma.category.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('createCategory', () => {
    it('should create a new category', async () => {
      const newCategory = { name: 'New Category', parentId: null };
      const createdCategory = { id: 1, ...newCategory };
      (prisma.category.create as jest.Mock).mockResolvedValue(createdCategory);

      const category = await categoryService.createCategory(newCategory.name, newCategory.parentId);
      expect(category).toEqual(createdCategory);
      expect(prisma.category.create).toHaveBeenCalledWith({ data: newCategory });
    });
  });

  describe('updateCategory', () => {
    it('should update an existing category', async () => {
      const updatedCategory = { id: 1, name: 'Updated Category', parentId: null };
      (prisma.category.update as jest.Mock).mockResolvedValue(updatedCategory);

      const category = await categoryService.updateCategory(1, 'Updated Category');
      expect(category).toEqual(updatedCategory);
      expect(prisma.category.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: 'Updated Category', parentId: undefined },
      });
    });

    it('should throw an error if category not found', async () => {
      (prisma.category.update as jest.Mock).mockRejectedValue(new Prisma.PrismaClientKnownRequestError('Record to update not found', { code: 'P2025', clientVersion: '2.20.1' }));

      await expect(categoryService.updateCategory(999, 'Non Existent')).rejects.toThrow('Category not found');
    });
  });

  describe('deleteCategory', () => {
    it('should delete an existing category', async () => {
      (prisma.category.delete as jest.Mock).mockResolvedValue({ id: 1 });

      await categoryService.deleteCategory(1);
      expect(prisma.category.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw an error if category not found', async () => {
      (prisma.category.delete as jest.Mock).mockRejectedValue(new Prisma.PrismaClientKnownRequestError('Record to delete not found', { code: 'P2025', clientVersion: '2.20.1' }));

      await expect(categoryService.deleteCategory(999)).rejects.toThrow('Category not found');
    });
  });
});
