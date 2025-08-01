"use strict";
// src/utils/email.ts
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
exports.sendOrderStatusEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const handlebars_1 = __importDefault(require("handlebars"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const config_1 = require("../config");
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: config_1.NODEMAILER_EMAIL,
        pass: config_1.NODEMAILER_PASS,
    },
});
/**
 * Fungsi umum untuk mengirim email notifikasi status pesanan.
 */
const sendOrderStatusEmail = (to, subject, payload, templateName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const templatePath = path_1.default.join(process.cwd(), "src", "templates", `${templateName}.hbs`);
        const templateContent = fs_1.default.readFileSync(templatePath, "utf-8");
        const template = handlebars_1.default.compile(templateContent);
        const html = template(payload);
        const mailOptions = {
            from: `"Freshmart" <${config_1.NODEMAILER_EMAIL}>`,
            to: to,
            subject: subject,
            html: html,
        };
        yield transporter.sendMail(mailOptions);
        console.log(`Order status email sent successfully to ${to}`);
    }
    catch (error) {
        console.error(`Error sending email to ${to}:`, error);
    }
});
exports.sendOrderStatusEmail = sendOrderStatusEmail;
