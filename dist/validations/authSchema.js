"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetConfirmSchema = exports.resetRequestSchema = exports.loginSchema = exports.verifySchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(3),
    email: zod_1.z.string().email(),
    referralCode: zod_1.z.string().optional(),
});
exports.verifySchema = zod_1.z.object({
    token: zod_1.z.string(),
    password: zod_1.z.string().min(6),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
});
exports.resetRequestSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
});
exports.resetConfirmSchema = zod_1.z.object({
    token: zod_1.z.string(),
    password: zod_1.z.string().min(6),
});
