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
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestResetController = requestResetController;
exports.confirmResetController = confirmResetController;
const authSchema_1 = require("../validations/authSchema");
const resetPasswordService_1 = require("../services/resetPasswordService");
function requestResetController(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { email } = authSchema_1.resetRequestSchema.parse(req.body);
            const result = yield (0, resetPasswordService_1.requestResetPasswordService)(email);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({
                error: error.message || "Terjadi kesalahan saat reset password",
            });
        }
    });
}
function confirmResetController(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { token, password } = authSchema_1.resetConfirmSchema.parse(req.body);
            const result = yield (0, resetPasswordService_1.confirmResetPasswordService)(token, password);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({
                error: error.message || "Terjadi kesalahan saat reset password",
            });
        }
    });
}
