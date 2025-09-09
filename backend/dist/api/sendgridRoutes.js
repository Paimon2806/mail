"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendgridRoutes = void 0;
const express_1 = __importDefault(require("express"));
const prisma_1 = require("../lib/prisma");
const queue_1 = require("../lib/queue");
const router = express_1.default.Router();
exports.sendgridRoutes = router;
router.post('/sendgrid', async (req, res) => {
    const { messageId, subject, from, text } = req.body;
    if (!messageId) {
        return res.status(400).json({ error: 'Bad Request: messageId is missing' });
    }
    const email = await prisma_1.prisma.email.create({
        data: {
            sendgridMessageId: messageId,
            subject,
            from,
            body: text,
        },
    });
    await queue_1.queue.add('process-email', { emailId: email.id });
    res.status(200).json({ message: 'Email received and queued for processing.' });
});
