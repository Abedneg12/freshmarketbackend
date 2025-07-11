import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
import { JWT_SECRET } from "../config";

const SECRET_KEY = JWT_SECRET || "supersecret";

export async function loginService(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Email atau password salah");
  if (!user.password) {
    throw new Error(
      "Akun ini terdaftar melakukan Google. Silahkan login menggunakan Google."
    );
  }
  if (!user.isVerified)
    throw new Error("Akun belum diverifikasi. Silahkan cek email Anda.");
  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("Password salah");

  const tokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
  };

  const token = jwt.sign(tokenPayload, SECRET_KEY, {
    expiresIn: "7d",
  });
  return { message: "Login berhasil", token };
}
