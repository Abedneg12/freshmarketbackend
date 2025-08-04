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
exports.registerService = registerService;
exports.resendVerificationService = resendVerificationService;
const prisma_1 = __importDefault(require("../lib/prisma"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verificationEmail_1 = require("../utils/verificationEmail");
const config_1 = require("../config");
const SECRET_KEY = config_1.JWT_SECRET || "supersecret";
function registerService(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const exists = yield prisma_1.default.user.findUnique({ where: { email: data.email } });
        if (exists)
            throw new Error("Email sudah terdaftar");
        const nameCode = data.fullName.split(" ")[0].toLowerCase();
        const newReferralCode = `REF-${nameCode}-${Date.now().toString().slice(-4)}`;
        const voucherCode = "VCHR-" + Math.random().toString(36).substring(2, 6).toUpperCase();
        const user = yield prisma_1.default.user.create({
            data: {
                fullName: data.fullName,
                email: data.email,
                isVerified: false,
                referralCode: newReferralCode,
            },
        });
        if (data.referralCode) {
            const referrer = yield prisma_1.default.user.findUnique({
                where: { referralCode: data.referralCode },
            });
            // voucher user baru yang menggunakan referral code
            if (referrer) {
                yield prisma_1.default.voucher.create({
                    data: {
                        code: voucherCode,
                        type: "CART",
                        value: 10,
                        startDate: new Date(),
                        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 hari
                        userVouchers: {
                            create: { user: { connect: { id: user.id } } },
                        },
                    },
                });
                // voucher untuk referrer
                yield prisma_1.default.voucher.create({
                    data: {
                        code: voucherCode,
                        type: "CART",
                        value: 20,
                        startDate: new Date(),
                        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                        userVouchers: {
                            create: { user: { connect: { id: referrer.id } } },
                        },
                    },
                });
                yield prisma_1.default.referralLog.create({
                    data: {
                        referredUser: { connect: { id: user.id } },
                        referrerUser: { connect: { id: referrer.id } },
                        rewardType: "VOUCHER",
                        rewardDetail: `NewUser:${10},Referrer:${20}`,
                    },
                });
                yield prisma_1.default.user.update({
                    where: { id: user.id },
                    data: { referredById: referrer.id },
                });
            }
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, type: "registration" }, SECRET_KEY, { expiresIn: "1h" });
        const verificationLink = `https://freshmarketfrontend.vercel.app/auth/verify?token=${token}`;
        yield (0, verificationEmail_1.sendVerificationEmail)(user.email, user.fullName, verificationLink);
        return {
            message: "Registrasi berhasil, silahkan cek email untuk verifikasi",
        };
    });
}
function resendVerificationService(email) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield prisma_1.default.user.findUnique({
            where: { email: email },
        });
        if (!user) {
            throw new Error("Pengguna dengan email ini tidak ditemukan.");
        }
        if (user.isVerified) {
            throw new Error("Akun ini sudah diverifikasi.");
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, type: "registration" }, SECRET_KEY, { expiresIn: "1h" });
        const verificationLink = `https://freshmarketfrontend.vercel.app/auth/verify?token=${token}`;
        yield (0, verificationEmail_1.sendVerificationEmail)(user.email, user.fullName, verificationLink);
        return {
            message: "Email verifikasi baru telah dikirim. Silakan periksa email Anda.",
        };
    });
}
