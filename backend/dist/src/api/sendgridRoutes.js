"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendgridRoutes = void 0;
const express_1 = __importDefault(require("express"));
const emailService_1 = require("../services/emailService");
const queue_1 = require("../lib/queue");
const router = express_1.default.Router();
exports.sendgridRoutes = router;
router.post('/sendgrid', async (req, res) => {
    const { messageId, subject, from, text } = req.body;
    if (!messageId || typeof messageId !== 'string' || messageId.trim() === '') {
        return res.status(400).json({ error: 'Bad Request: messageId is required and must be a non-empty string.' });
    }
    if (!from || typeof from !== 'string' || from.trim() === '') {
        return res.status(400).json({ error: 'Bad Request: from is required and must be a non-empty string.' });
    }
    if (subject !== undefined && (typeof subject !== 'string')) {
        return res.status(400).json({ error: 'Bad Request: subject must be a string.' });
    }
    if (text !== undefined && (typeof text !== 'string')) {
        return res.status(400).json({ error: 'Bad Request: text must be a string.' });
    }
    try {
        const email = await emailService_1.emailService.createEmail(messageId, from, subject, text);
        await queue_1.queue.add('process-email', { emailId: email.id });
        res.status(200).json({ message: 'Email received and queued for processing.' });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
