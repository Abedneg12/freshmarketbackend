import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
import { JWT_SECRET } from "../config";
import bcrypt from "bcrypt";

const SECRET_KEY = JWT_SECRET || "supersecret";

export async function verifyService(token: string, password: string) {
  try {
    const decoded = jwt.verify(token, SECRET_KEY) as {
      userId: string;
      iat: number;
      exp: number;
    };
    const user = await prisma.user.findUnique({
      where: { id: Number(decoded.userId) },
    });
    if (!user) {
      throw new Error("User tidak ditemukan.");
    }
    if (user.isVerified) {
      throw new Error(
        "Akun ini sudah terverifikasi sebelumnya. Silahkan langsung login."
      );
    }
    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed, isVerified: true },
    });
    return { message: "Verifikasi berhasil, silahkan login dengan akun Anda" };
  } catch (error: any) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error(
        "Token verifikasi sudah kadaluwarsa. Silahkan minta email verifikasi baru."
      );
    }
    throw error;
  }
}
