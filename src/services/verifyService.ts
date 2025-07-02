import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
import { JWT_SECRET } from "../config";
import bcrypt from "bcrypt";

const SECRET_KEY = JWT_SECRET || "supersecret";

export async function verifyService(token: string, password: string) {
  const decoded = jwt.verify(token, SECRET_KEY) as { userId: string };
  const user = await prisma.user.findUnique({
    where: { id: Number(decoded.userId) },
  });
  if (!user) throw new Error("User tidak ditemukan");
  if (user.isVerified) throw new Error("User sudah terverifikasi");

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed, isVerified: true },
  });
  return { message: "Verifikasi berhasil, silahkan login dengan akun Anda" };
}
