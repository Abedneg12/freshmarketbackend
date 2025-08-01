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
exports.OAuthLogin = OAuthLogin;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const config_1 = require("../config");
const SECRET_KEY = config_1.JWT_SECRET || "supersecret";
function OAuthLogin(profile) {
    return __awaiter(this, void 0, void 0, function* () {
        // cari user berdasarkan provider + providerId
        let user = yield prisma_1.default.user.findFirst({
            where: {
                provider: profile.provider,
                providerId: profile.providerId,
            },
        });
        if (!user) {
            // jika belum ada, buat user baru
            const nameCode = profile.displayName.split(" ")[0].toLowerCase();
            const newReferralCode = `REF-${nameCode}-${Date.now()
                .toString()
                .slice(-4)}`;
            user = yield prisma_1.default.user.create({
                data: {
                    fullName: profile.displayName,
                    email: profile.email,
                    isVerified: true,
                    provider: profile.provider,
                    providerId: profile.providerId,
                    referralCode: newReferralCode,
                },
            });
        }
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
        };
        const token = jsonwebtoken_1.default.sign(payload, SECRET_KEY, {
            expiresIn: "7d",
        });
        return { user, token };
    });
}
