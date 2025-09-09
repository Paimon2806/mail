import express from 'express';
import { sendgridRoutes } from './api/sendgridRoutes';
import { categoryRoutes } from './api/categoryRoutes';
import { emailRoutes } from './api/emailRoutes';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './middleware/logger';

const app = express();
app.use(express.json());
app.use(logger);

app.use('/webhooks', sendgridRoutes);
app.use('/categories', categoryRoutes);
app.use('/emails', emailRoutes);

app.use(errorHandler);

export { app };
