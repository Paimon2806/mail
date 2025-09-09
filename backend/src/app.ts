import express from 'express';
import { sendgridRoutes } from './api/sendgridRoutes';
import { categoryRoutes } from './api/categoryRoutes';

const app = express();
app.use(express.json());

app.use('/webhooks', sendgridRoutes);
app.use('/categories', categoryRoutes);

export { app };
