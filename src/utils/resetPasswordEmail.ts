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

export async function sendResetPasswordemail(
  email: string,
  name: string,
  link: string
) {
  const templatePath = path.join(
    process.cwd(),
    "src",
    "templates",
    "resetPassword.hbs"
  );
  const templateContent = fs.readFileSync(templatePath, "utf-8");
  const template = handlebars.compile(templateContent);

  const html = template({ name, link });

  await transporter.sendMail({
    from: `"Freshmarket" <${process.env.NODEMAILER_EMAIL}>`,
    to: email,
    subject: "Reset Password",
    html,
  });
}
