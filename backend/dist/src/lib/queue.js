"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queue = void 0;
const bullmq_1 = require("bullmq");
exports.queue = new bullmq_1.Queue('email-processing', {
    connection: {
        host: 'localhost',
        port: 6379,
    },
});
