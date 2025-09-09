"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryService = void 0;
const prisma_1 = require("../lib/prisma");
const client_1 = require("@prisma/client");
exports.categoryService = {
    async getAllCategories() {
        return prisma_1.prisma.category.findMany();
    },
    async createCategory(name, parentId) {
        return prisma_1.prisma.category.create({
            data: {
                name,
                parentId,
            },
        });
    },
    async updateCategory(id, name, parentId) {
        try {
            return await prisma_1.prisma.category.update({
                where: { id },
                data: {
                    name,
                    parentId,
                },
            });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                throw new Error('Category not found');
            }
            throw error;
        }
    },
    async deleteCategory(id) {
        try {
            return await prisma_1.prisma.category.delete({
                where: { id },
            });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                throw new Error('Category not found');
            }
            throw error;
        }
    },
};
