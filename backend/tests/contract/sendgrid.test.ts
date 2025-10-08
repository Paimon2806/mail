import request from 'supertest';
import { app } from '../../src/app';
import { prisma } from '../../src/lib/prisma';
import { queue } from '../../src/lib/queue';

jest.mock('../../src/lib/prisma', () => ({
  prisma: {
    email: {
      create: jest.fn(),
    },
  },
}));

jest.mock('../../src/lib/queue', () => ({
  queue: {
    add: jest.fn(),
  },
}));

describe('POST /webhooks/sendgrid', () => {
  it('should return 200 and queue the email for processing', async () => {
    const payload = {
      to: 'test@example.com',
      from: 'sender@example.com',
      subject: 'Test Subject',
      text: 'This is a test email.',
      html: '<p>This is a test email.</p>',
      envelope: {
        to: ['test@example.com'],
        from: 'sender@example.com',
      },
      messageId: 'test-message-id',
    };

    (prisma.email.create as jest.Mock).mockResolvedValue({
      id: 1,
      ...payload,
    });

    const response = await request(app)
      .post('/webhooks/sendgrid')
      .send(payload);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Email received and queued for processing.' });

    expect(prisma.email.create).toHaveBeenCalledWith({
      data: {
        sendgridMessageId: payload.messageId,
        subject: payload.subject,
        from: payload.from,
        body: payload.text,
      },
    });

    expect(queue.add).toHaveBeenCalledWith('process-email', { emailId: 1 });
  });
});
