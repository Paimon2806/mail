import { emailService } from '../../src/services/emailService';
import { prisma } from '../../src/lib/prisma';

jest.mock('../../src/lib/prisma', () => ({
  prisma: {
    email: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('Email Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createEmail', () => {
    it('should create a new email', async () => {
      const newEmail = {
        sendgridMessageId: 'msg1',
        from: 'test@example.com',
        subject: 'Test Subject',
        body: 'Test Body',
      };
      const createdEmail = { id: 1, ...newEmail, receivedAt: new Date(), categoryId: null };
      (prisma.email.create as jest.Mock).mockResolvedValue(createdEmail);

      const email = await emailService.createEmail(
        newEmail.sendgridMessageId,
        newEmail.from,
        newEmail.subject,
        newEmail.body
      );
      expect(email).toEqual(createdEmail);
      expect(prisma.email.create).toHaveBeenCalledWith({ data: newEmail });
    });
  });

  describe('getAllEmails', () => {
    it('should return all emails', async () => {
      const mockEmails = [
        { id: 1, sendgridMessageId: 'msg1', from: 'a@b.com', receivedAt: new Date() },
      ];
      (prisma.email.findMany as jest.Mock).mockResolvedValue(mockEmails);

      const emails = await emailService.getAllEmails();
      expect(emails).toEqual(mockEmails);
      expect(prisma.email.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('getEmailById', () => {
    it('should return an email by ID', async () => {
      const mockEmail = { id: 1, sendgridMessageId: 'msg1', from: 'a@b.com', receivedAt: new Date() };
      (prisma.email.findUnique as jest.Mock).mockResolvedValue(mockEmail);

      const email = await emailService.getEmailById(1);
      expect(email).toEqual(mockEmail);
      expect(prisma.email.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should return null if email not found', async () => {
      (prisma.email.findUnique as jest.Mock).mockResolvedValue(null);

      const email = await emailService.getEmailById(999);
      expect(email).toBeNull();
    });
  });

  describe('updateEmailCategory', () => {
    it(`should update an email's category`, async () => {
      const updatedEmail = { id: 1, categoryId: 2 };
      (prisma.email.update as jest.Mock).mockResolvedValue(updatedEmail);

      const email = await emailService.updateEmailCategory(1, 2);
      expect(email).toEqual(updatedEmail);
      expect(prisma.email.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { categoryId: 2 },
      });
    });
  });
});
