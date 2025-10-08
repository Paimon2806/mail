"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailRoutes = void 0;
const express_1 = __importDefault(require("express"));
const emailService_1 = require("../services/emailService");
const router = express_1.default.Router();
exports.emailRoutes = router;
router.get('/', async (req, res) => {
    if (Object.keys(req.query).length > 0) {
        return res.status(400).json({ error: 'Bad Request: No query parameters are supported for this endpoint.' });
    }
    try {
        const emails = await emailService_1.emailService.getAllEmails();
        res.json(emails);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
