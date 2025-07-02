import prisma from "../lib/prisma";
import jwt from "jsonwebtoken";
import { JWT_SECRET, FE_PORT } from "../config";
import { sendResetPasswordemail } from "../utils/resetPasswordEmail";
import bcrypt from "bcrypt";

const SECRET_KEY = JWT_SECRET || "supersecret";

export async function requestResetPasswordService(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Email tidak ditemukan");
  if (!user.password) throw new Error("Hanya password yang dapat direset");

  const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: "1h" });
  const resetUrl = `${FE_PORT}/reset.password?token=${token}`;
  await sendResetPasswordemail(user.email, token, resetUrl);
  return { message: "Cek email Anda untuk reset password" };
}

export async function confirmResetPasswordService(
  token: string,
  password: string
) {
  const payload = jwt.verify(token, SECRET_KEY) as { userId: string };
  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { id: Number(payload.userId) },
    data: { password: hashed },
  });
  return {
    message: "Password berhasil direset, silahkan login dengan akun Anda",
  };
}
