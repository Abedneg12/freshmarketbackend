// src/utils/email.ts

import nodemailer from "nodemailer";
import handlebars from "handlebars";
import fs from "fs";
import path from "path";
import { NODEMAILER_EMAIL, NODEMAILER_PASS } from "../config";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: NODEMAILER_EMAIL,
    pass: NODEMAILER_PASS,
  },
});

// Definisikan tipe data untuk payload email
interface EmailPayload {
  name: string;
  orderId: number;
  status: string;
  message: string;
  orderUrl: string; // <-- 1. Tambahkan properti ini
}

/**
 * Fungsi umum untuk mengirim email notifikasi status pesanan.
 */
export const sendOrderStatusEmail = async (
  to: string,
  subject: string,
  payload: EmailPayload,
  templateName: string
) => {
  try {
    const templatePath = path.join(process.cwd(), "src", "templates", `${templateName}.hbs`);
    const templateContent = fs.readFileSync(templatePath, "utf-8");
    const template = handlebars.compile(templateContent);
    const html = template(payload);

    const mailOptions = {
      from: `"Freshmart" <${NODEMAILER_EMAIL}>`,
      to: to,
      subject: subject,
      html: html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Order status email sent successfully to ${to}`);
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
  }
};