import prisma from "../lib/prisma";
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from "../utils/verificationEmail";
import { JWT_SECRET } from "../config";

const SECRET_KEY = JWT_SECRET || "supersecret";

export async function registerService(data: {
  fullName: string;
  email: string;
  referralCode?: string;
}) {
  const exists = await prisma.user.findUnique({ where: { email: data.email } });
  if (exists) throw new Error("Email sudah terdaftar");

  const nameCode = data.fullName.split(" ")[0].toLowerCase();
  const newReferralCode = `REF-${nameCode}-${Date.now().toString().slice(-4)}`;
  const voucherCode =
    "VCHR-" + Math.random().toString(36).substring(2, 6).toUpperCase();

  const user = await prisma.user.create({
    data: {
      fullName: data.fullName,
      email: data.email,
      isVerified: false,
      referralCode: newReferralCode,
    },
  });

  if (data.referralCode) {
    const referrer = await prisma.user.findUnique({
      where: { referralCode: data.referralCode },
    });

    // voucher user baru yang menggunakan referral code
    if (referrer) {
      await prisma.voucher.create({
        data: {
          code: voucherCode,
          type: "CART",
          value: 10,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 hari
          userVouchers: {
            create: { user: { connect: { id: user.id } } },
          },
        },
      });

      // voucher untuk referrer
      await prisma.voucher.create({
        data: {
          code: voucherCode,
          type: "CART",
          value: 20,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          userVouchers: {
            create: { user: { connect: { id: referrer.id } } },
          },
        },
      });

      await prisma.referralLog.create({
        data: {
          referredUser: { connect: { id: user.id } },
          referrerUser: { connect: { id: referrer.id } },
          rewardType: "VOUCHER",
          rewardDetail: `NewUser:${10},Referrer:${20}`,
        },
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { referredById: referrer.id },
      });
    }
  }

  const token = jwt.sign(
    { userId: user.id, type: "registration" },
    SECRET_KEY,
    { expiresIn: "1h" }
  );
  const verificationLink = `https://freshmarketfrontend.vercel.app/auth/verify?token=${token}`;
  await sendVerificationEmail(user.email, user.fullName, verificationLink);

  return {
    message: "Registrasi berhasil, silahkan cek email untuk verifikasi",
  };
}

export async function resendVerificationService(email: string) {
  const user = await prisma.user.findUnique({
    where: { email: email },
  });

  if (!user) {
    throw new Error("Pengguna dengan email ini tidak ditemukan.");
  }

  if (user.isVerified) {
    throw new Error("Akun ini sudah diverifikasi.");
  }

  const token = jwt.sign(
    { userId: user.id, type: "registration" },
    SECRET_KEY,
    { expiresIn: "1h" }
  );
  const verificationLink = `https://freshmarketfrontend.vercel.app/auth/verify?token=${token}`;
  await sendVerificationEmail(user.email, user.fullName, verificationLink);

  return {
    message: "Email verifikasi baru telah dikirim. Silakan periksa email Anda.",
  };
}
