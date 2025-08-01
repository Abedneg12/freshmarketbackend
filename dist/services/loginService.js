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
exports.loginService = loginService;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const config_1 = require("../config");
const SECRET_KEY = config_1.JWT_SECRET || "supersecret";
function loginService(email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield prisma_1.default.user.findUnique({ where: { email } });
        if (!user)
            throw new Error("Email atau password salah");
        if (!user.password) {
            throw new Error("Akun ini terdaftar melakukan Google. Silahkan login menggunakan Google.");
        }
        if (!user.isVerified)
            throw new Error("Akun belum diverifikasi. Silahkan cek email Anda.");
        const match = yield bcrypt_1.default.compare(password, user.password);
        if (!match)
            throw new Error("Password salah");
        const tokenPayload = {
            id: user.id,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
        };
        const token = jsonwebtoken_1.default.sign(tokenPayload, SECRET_KEY, {
            expiresIn: "7d",
        });
        return { message: "Login berhasil", token };
    });
}
