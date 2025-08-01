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
exports.loginController = loginController;
const authSchema_1 = require("../validations/authSchema");
const loginService_1 = require("../services/loginService");
function loginController(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { email, password } = authSchema_1.loginSchema.parse(req.body);
            const result = yield (0, loginService_1.loginService)(email, password);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message || "Login gagal" });
        }
    });
}
