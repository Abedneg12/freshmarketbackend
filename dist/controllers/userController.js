"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfileController = getProfileController;
exports.updateProfileController = updateProfileController;
exports.changePasswordController = changePasswordController;
exports.updateProfilePictureController = updateProfilePictureController;
exports.requestEmailUpdateController = requestEmailUpdateController;
exports.confirmEmailUpdateController = confirmEmailUpdateController;
exports.createPasswordController = createPasswordController;
const userService = __importStar(require("../services/userService"));
const config_1 = require("../config");
function getProfileController(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userProfile = yield userService.getProfileService(req.user);
            res.status(200).json({
                message: "Profil berhasil diambil",
                data: userProfile,
            });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    });
}
function updateProfileController(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { fullName } = req.body;
            if (!fullName) {
                res.status(400).json({ error: "Nama lengkap tidak boleh kosong" });
            }
            const updatedUser = yield userService.updateProfileService(req.user.id, fullName);
            res.status(200).json({
                message: "Profil berhasil diperbarui",
                data: updatedUser,
            });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    });
}
function changePasswordController(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { currentPassword, newPassword } = req.body;
            if (!currentPassword || !newPassword) {
                res.status(400).json({ error: "Password lama dan baru wajib diisi" });
                return;
            }
            yield userService.changePasswordService(req.user.id, currentPassword, newPassword);
            res.status(200).json({ message: "Password berhasil diubah" });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    });
}
function updateProfilePictureController(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.file) {
                res.status(400).json({ error: "Tidak ada file yang di unggah." });
                return;
            }
            const result = yield userService.updateProfilePictureService(req.user.id, req.file);
            res
                .status(200)
                .json({ message: "Foto profil berhasil diperbarui", data: result });
        }
        catch (error) {
            console.error("[PROFILE PICTURE UPLOAD ERROR]:", error);
            res.status(500).json({ error: error.message });
        }
    });
}
function requestEmailUpdateController(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userId = req.user.id;
            const { newEmail } = req.body;
            if (!newEmail) {
                res.status(400).json({ error: "Email baru tidak boleh kosong." });
                return;
            }
            const result = yield userService.requestEmailUpdateService(userId, newEmail);
            res.status(200).json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    });
}
function confirmEmailUpdateController(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { token } = req.query;
            if (!token || typeof token !== "string") {
                return res
                    .status(400)
                    .json({ error: "Token tidak valid atau tidak ada." });
            }
            yield userService.confirmEmailUpdateService(token);
            return res.redirect(`${config_1.FE_PORT}/profile?email_update_success=true`);
        }
        catch (error) {
            const errorMessage = encodeURIComponent(error.message || "Konfirmasi email gagal");
            return res.redirect(`${config_1.FE_PORT}/error?message=${errorMessage}`);
        }
    });
}
function createPasswordController(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userId = req.user.id;
            const { password } = req.body;
            if (!password) {
                res.status(400).json({ error: "Password tidak boleh kosong." });
                return;
            }
            yield userService.createPasswordService(userId, password);
            res.status(200).json({ message: "Password berhasil dibuat." });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    });
}
