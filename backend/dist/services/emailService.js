"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = void 0;
const prisma_1 = require("../lib/prisma");
exports.emailService = {
    async createEmail(sendgridMessageId, from, subject, body) {
        return prisma_1.prisma.email.create({
            data: {
                sendgridMessageId,
                from,
                subject,
                body,
            },
        });
    },
    async getAllEmails() {
        return prisma_1.prisma.email.findMany();
    },
    async getEmailById(id) {
        return prisma_1.prisma.email.findUnique({
            where: { id },
        });
    },
    async updateEmailCategory(id, categoryId) {
        return prisma_1.prisma.email.update({
            where: { id },
            data: {
                categoryId,
            },
        });
    },
};
