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
exports.getProfileService = getProfileService;
exports.updateProfileService = updateProfileService;
exports.changePasswordService = changePasswordService;
exports.updateProfilePictureService = updateProfilePictureService;
exports.requestEmailUpdateService = requestEmailUpdateService;
exports.confirmEmailUpdateService = confirmEmailUpdateService;
exports.createPasswordService = createPasswordService;
exports.deleteProfilePictureService = deleteProfilePictureService;
const prisma_1 = __importDefault(require("../lib/prisma"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const cloudinary_1 = require("../utils/cloudinary");
const updateEmailVerification_1 = require("../utils/updateEmailVerification");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const SECRET_KEY = config_1.JWT_SECRET || "supersecret";
function getProfileService(userPayLoad) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield prisma_1.default.user.findUnique({
            where: { id: userPayLoad.id },
        });
        if (!user) {
            throw new Error("User tidak ditemukan");
        }
        return {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            profilePicture: user.profilePicture,
            referralCode: user.referralCode,
            isVerified: user.isVerified,
            role: user.role,
            hashPassword: !!user.password,
            provider: user.provider,
        };
    });
}
function updateProfileService(userId, newfullName) {
    return __awaiter(this, void 0, void 0, function* () {
        const updatedUser = yield prisma_1.default.user.update({
            where: { id: userId },
            data: { fullName: newfullName },
            select: {
                id: true,
                fullName: true,
                email: true,
            },
        });
        return updatedUser;
    });
}
function changePasswordService(userId, oldPass, newPass) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new Error("User tidak ditemukan");
        }
        if (!user.password) {
            throw new Error("Akun ini tidak memiliki password, tidak dapat diubah");
        }
        const isMatch = yield bcrypt_1.default.compare(oldPass, user.password);
        if (!isMatch) {
            throw new Error("Password lama salah");
        }
        const hashedNewPassword = yield bcrypt_1.default.hash(newPass, 10);
        yield prisma_1.default.user.update({
            where: { id: userId },
            data: { password: hashedNewPassword },
        });
    });
}
function updateProfilePictureService(userId, file) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield prisma_1.default.user.findUnique({
            where: { id: userId },
            select: { profilePicture: true },
        });
        if (!user)
            throw new Error("User tidak ditemukan.");
        if (user.profilePicture) {
            yield (0, cloudinary_1.cloudinaryRemove)(user.profilePicture);
        }
        const uploadResult = yield (0, cloudinary_1.cloudinaryUpload)(file);
        return yield prisma_1.default.user.update({
            where: { id: userId },
            data: { profilePicture: uploadResult.secure_url },
            select: { id: true, profilePicture: true },
        });
    });
}
function requestEmailUpdateService(userId, newEmail) {
    return __awaiter(this, void 0, void 0, function* () {
        const emailExist = yield prisma_1.default.user.findFirst({
            where: {
                email: {
                    equals: newEmail,
                    mode: "insensitive",
                },
                NOT: {
                    id: userId,
                },
            },
        });
        if (emailExist) {
            throw new Error("Email ini sudah digunakan oleh akun lain.");
        }
        const user = yield prisma_1.default.user.findUnique({
            where: { id: userId },
            select: { fullName: true },
        });
        if (!user) {
            throw new Error("User tidak ditemukan.");
        }
        const token = jsonwebtoken_1.default.sign({ userId, newEmail, type: "email_update" }, SECRET_KEY, { expiresIn: "1h" });
        const confirmationLink = `https://freshmarketbackend.vercel.app/api/user/confirm-email-update?token=${token}`;
        yield (0, updateEmailVerification_1.sendUpdateEmailVerification)(newEmail, user.fullName, confirmationLink);
        return {
            message: `Sebuah link konfirmasi telah dikirim ke ${newEmail}. Silakan periksa email Anda untuk menyelesaikan perubahan.`,
        };
    });
}
function confirmEmailUpdateService(token) {
    return __awaiter(this, void 0, void 0, function* () {
        const decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY);
        if (decoded.type !== "email_update") {
            throw new Error("Token tidak valid untuk aksi ini.");
        }
        yield prisma_1.default.user.update({
            where: { id: decoded.userId },
            data: {
                email: decoded.newEmail,
            },
        });
        return { message: "Alamat email Anda telah diperbarui." };
    });
}
function createPasswordService(userId, password) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new Error("User tidak ditemukan.");
        }
        if (user.password) {
            throw new Error("Akun ini tidak memiliki password");
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        yield prisma_1.default.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
    });
}
function deleteProfilePictureService(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield prisma_1.default.user.findUnique({
            where: { id: userId },
            select: { profilePicture: true },
        });
        if (!user)
            throw new Error("User tidak ditemukan.");
        if (user.profilePicture) {
            yield (0, cloudinary_1.cloudinaryRemove)(user.profilePicture);
        }
        return yield prisma_1.default.user.update({
            where: { id: userId },
            data: { profilePicture: null },
            select: { id: true, profilePicture: true },
        });
    });
}
