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
exports.requestResetPasswordService = requestResetPasswordService;
exports.confirmResetPasswordService = confirmResetPasswordService;
const prisma_1 = __importDefault(require("../lib/prisma"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const resetPasswordEmail_1 = require("../utils/resetPasswordEmail");
const bcrypt_1 = __importDefault(require("bcrypt"));
const SECRET_KEY = config_1.JWT_SECRET || "supersecret";
function requestResetPasswordService(email) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield prisma_1.default.user.findUnique({ where: { email } });
        if (!user)
            throw new Error("Email tidak ditemukan");
        if (!user.password)
            throw new Error("Hanya password yang dapat direset");
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, SECRET_KEY, { expiresIn: "1h" });
        const resetUrl = `${config_1.FE_PORT}/reset-password?token=${token}`;
        yield (0, resetPasswordEmail_1.sendResetPasswordemail)(user.email, user.fullName, resetUrl);
        return { message: "Cek email Anda untuk reset password" };
    });
}
function confirmResetPasswordService(token, password) {
    return __awaiter(this, void 0, void 0, function* () {
        const payload = jsonwebtoken_1.default.verify(token, SECRET_KEY);
        const hashed = yield bcrypt_1.default.hash(password, 10);
        yield prisma_1.default.user.update({
            where: { id: Number(payload.userId) },
            data: { password: hashed },
        });
        return {
            message: "Password berhasil direset, silahkan login dengan akun Anda",
        };
    });
}
