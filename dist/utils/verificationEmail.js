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
exports.sendVerificationEmail = sendVerificationEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const handlebars_1 = __importDefault(require("handlebars"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASS,
    },
});
function sendVerificationEmail(email, name, link) {
    return __awaiter(this, void 0, void 0, function* () {
        const templatePath = path_1.default.join(process.cwd(), "src", "templates", "verifyEmail.hbs");
        const templateContent = fs_1.default.readFileSync(templatePath, "utf-8");
        const template = handlebars_1.default.compile(templateContent);
        const html = template({ name, link });
        yield transporter.sendMail({
            from: `"Freshmart" <${process.env.NODEMAILER_EMAIL}>`,
            to: email,
            subject: "Verifikasi Akun Freshmarket",
            html,
        });
    });
}
