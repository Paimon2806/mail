import { prisma } from '../lib/prisma';

export const emailService = {
  async createEmail(sendgridMessageId: string, from: string, subject?: string, body?: string) {
    return prisma.email.create({
      data: {
        sendgridMessageId,
        from,
        subject,
        body,
      },
    });
  },

  async getAllEmails() {
    return prisma.email.findMany();
  },

  async getEmailById(id: number) {
    return prisma.email.findUnique({
      where: { id },
    });
  },

  async updateEmailCategory(id: number, categoryId: number) {
    return prisma.email.update({
      where: { id },
      data: {
        categoryId,
      },
    });
  },
};
