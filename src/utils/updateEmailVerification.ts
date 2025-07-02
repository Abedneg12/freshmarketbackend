import nodemailer from "nodemailer";
import handlebars from "handlebars";
import fs from "fs";
import path from "path";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASS,
  },
});

export async function sendUpdateEmailVerification(
  email: string,
  name: string,
  link: string
) {
  const templatePath = path.join(
    process.cwd(),
    "src",
    "templates",
    "updateEmail.hbs"
  );
  const templateContent = fs.readFileSync(templatePath, "utf-8");
  const template = handlebars.compile(templateContent);

  const html = template({ name, link });

  await transporter.sendMail({
    from: `"Freshmart" <${process.env.NODEMAILER_EMAIL}>`,
    to: email,
    subject: "Verifikasi Akun Freshmarket",
    html,
  });
}
