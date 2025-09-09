"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const sendgridRoutes_1 = require("./api/sendgridRoutes");
const categoryRoutes_1 = require("./api/categoryRoutes");
const app = (0, express_1.default)();
exports.app = app;
app.use(express_1.default.json());
app.use('/webhooks', sendgridRoutes_1.sendgridRoutes);
app.use('/categories', categoryRoutes_1.categoryRoutes);
