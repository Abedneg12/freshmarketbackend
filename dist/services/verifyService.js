"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyService = verifyService;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const config_1 = require("../config");
const bcrypt_1 = __importDefault(require("bcrypt"));
const SECRET_KEY = config_1.JWT_SECRET || "supersecret";
function verifyService(token, password) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY);
            const user = yield prisma_1.default.user.findUnique({
                where: { id: Number(decoded.userId) },
            });
            if (!user) {
                throw new Error("User tidak ditemukan.");
            }
            if (user.isVerified) {
                throw new Error("Akun ini sudah terverifikasi sebelumnya. Silahkan langsung login.");
            }
            const hashed = yield bcrypt_1.default.hash(password, 10);
            yield prisma_1.default.user.update({
                where: { id: user.id },
                data: { password: hashed, isVerified: true },
            });
            return { message: "Verifikasi berhasil, silahkan login dengan akun Anda" };
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                throw new Error("Token verifikasi sudah kadaluwarsa. Silahkan minta email verifikasi baru.");
            }
            throw error;
        }
    });
}
