"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryRoutes = void 0;
const express_1 = __importDefault(require("express"));
const prisma_1 = require("../lib/prisma");
const router = express_1.default.Router();
exports.categoryRoutes = router;
router.get('/', async (req, res) => {
    const categories = await prisma_1.prisma.category.findMany();
    res.json(categories);
});
router.post('/', async (req, res) => {
    const { name, parentId } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Bad Request: name is missing' });
    }
    const category = await prisma_1.prisma.category.create({
        data: {
            name,
            parentId,
        },
    });
    res.status(201).json(category);
});
