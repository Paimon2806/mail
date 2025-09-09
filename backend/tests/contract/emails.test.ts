import request from 'supertest';
import { app } from '../../src/app';
import { prisma } from '../../src/lib/prisma';

jest.mock('../../src/lib/prisma', () => ({
  prisma: {
    email: {
      findMany: jest.fn(),
    },
  },
}));

describe('GET /emails', () => {
  it('should return an empty array when no emails exist', async () => {
    (prisma.email.findMany as jest.Mock).mockResolvedValue([]);
    const response = await request(app).get('/emails');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it('should return a list of emails', async () => {
    const mockEmails = [
      {
        id: 1,
        sendgridMessageId: 'msg1',
        subject: 'Test Email 1',
        from: 'sender1@example.com',
        body: 'Body 1',
        receivedAt: new Date().toISOString(),
        categoryId: null,
      },
      {
        id: 2,
        sendgridMessageId: 'msg2',
        subject: 'Test Email 2',
        from: 'sender2@example.com',
        body: 'Body 2',
        receivedAt: new Date().toISOString(),
        categoryId: null,
      },
    ];
    (prisma.email.findMany as jest.Mock).mockResolvedValue(mockEmails);

    const response = await request(app).get('/emails');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockEmails);
  });
});
