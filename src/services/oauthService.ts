import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
import { JWT_SECRET } from "../config";

const SECRET_KEY = JWT_SECRET || "supersecret";

interface OAuthProfile {
  provider: "google" | "facebook";
  providerId: string;
  email: string;
  displayName: string;
}

export async function OAuthLogin(profile: OAuthProfile) {
  // cari user berdasarkan provider + providerId
  let user = await prisma.user.findFirst({
    where: {
      provider: profile.provider,
      providerId: profile.providerId,
    },
  });

  if (!user) {
    // jika belum ada, buat user baru
    user = await prisma.user.create({
      data: {
        fullName: profile.displayName,
        email: profile.email,
        isVerified: true,
        provider: profile.provider,
        providerId: profile.providerId,
      },
    });
  }

  const token = jwt.sign({ userId: user.id, role: user.role }, SECRET_KEY, {
    expiresIn: "7d",
  });

  return { user, token };
}
