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
exports.verifiedOnlyMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const verifiedOnlyMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ message: "Unauthorized - No token provided" });
        return;
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = yield prisma_1.default.user.findUnique({ where: { id: decoded.id } });
        if (!user) {
            res.status(401).json({ message: "Unauthorized - User not found" });
            return;
        }
        if (!decoded.isVerified) {
            res.status(403).json({ message: "Forbidden - Account not verified" });
            return;
        }
        req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
        };
        next();
    }
    catch (error) {
        res.status(401).json({ message: "Unauthorized - Invalid token" });
    }
});
exports.verifiedOnlyMiddleware = verifiedOnlyMiddleware;
