import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';

export const categoryService = {
  async getAllCategories() {
    return prisma.category.findMany();
  },

  async createCategory(name: string, parentId?: number | null) {
    return prisma.category.create({
      data: {
        name,
        parentId,
      },
    });
  },

  async updateCategory(id: number, name?: string, parentId?: number | null) {
    try {
      return await prisma.category.update({
        where: { id },
        data: {
          name,
          parentId,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new Error('Category not found');
      }
      throw error;
    }
  },

  async deleteCategory(id: number) {
    try {
      return await prisma.category.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new Error('Category not found');
      }
      throw error;
    }
  },
};
