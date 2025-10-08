import { Queue } from 'bullmq';

export const queue = new Queue('email-processing', {
  connection: {
    host: 'localhost',
    port: 6379,
  },
});
