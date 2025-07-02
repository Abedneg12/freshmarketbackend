import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
import { JWT_SECRET } from "../config";

const SECRET_KEY = JWT_SECRET || "supersecret";

export async function loginService(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Email salah");
  if (!user.isVerified) throw new Error("Akun belum diverifikasi");
  const match = await bcrypt.compare(password, user.password!);
  if (!match) throw new Error("Password salah");

  const token = jwt.sign({ userId: user.id, role: user.role }, SECRET_KEY, {
    expiresIn: "7d",
  });
  return { message: "Login berhasil", token };
}
