import prisma from "../lib/prisma";
import { IUserPayload } from "../interfaces/IUserPayload";
import bcrypt from "bcrypt";
import { cloudinaryUpload, cloudinaryRemove } from "../utils/cloudinary";
import { sendUpdateEmailVerification } from "../utils/updateEmailVerification";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";

const SECRET_KEY = JWT_SECRET || "supersecret";

export async function getProfileService(userPayLoad: IUserPayload) {
  const user = await prisma.user.findUnique({
    where: { id: userPayLoad.id },
  });

  if (!user) {
    throw new Error("User tidak ditemukan");
  }

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    profilePicture: user.profilePicture,
    referralCode: user.referralCode,
    isVerified: user.isVerified,
    role: user.role,
    hashPassword: !!user.password,
    provider: user.provider,
  };
}
export async function updateProfileService(
  userId: number,
  newfullName: string
) {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { fullName: newfullName },
    select: {
      id: true,
      fullName: true,
      email: true,
    },
  });

  return updatedUser;
}

export async function changePasswordService(
  userId: number,
  oldPass: string,
  newPass: string
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new Error("User tidak ditemukan");
  }

  if (!user.password) {
    throw new Error("Akun ini tidak memiliki password, tidak dapat diubah");
  }

  const isMatch = await bcrypt.compare(oldPass, user.password);
  if (!isMatch) {
    throw new Error("Password lama salah");
  }

  const hashedNewPassword = await bcrypt.hash(newPass, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedNewPassword },
  });
}

export async function updateProfilePictureService(
  userId: number,
  file: Express.Multer.File
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { profilePicture: true },
  });
  if (!user) throw new Error("User tidak ditemukan.");

  if (user.profilePicture) {
    await cloudinaryRemove(user.profilePicture);
  }

  const uploadResult = await cloudinaryUpload(file);
  return await prisma.user.update({
    where: { id: userId },
    data: { profilePicture: uploadResult.secure_url },
    select: { id: true, profilePicture: true },
  });
}

export async function requestEmailUpdateService(
  userId: number,
  newEmail: string
) {
  const emailExist = await prisma.user.findFirst({
    where: {
      email: {
        equals: newEmail,
        mode: "insensitive",
      },
      NOT: {
        id: userId,
      },
    },
  });
  if (emailExist) {
    throw new Error("Email ini sudah digunakan oleh akun lain.");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { fullName: true },
  });

  if (!user) {
    throw new Error("User tidak ditemukan.");
  }

  const token = jwt.sign(
    { userId, newEmail, type: "email_update" },
    SECRET_KEY,
    { expiresIn: "1h" }
  );
  const confirmationLink = `https://freshmarketbackend.vercel.app/api/user/confirm-email-update?token=${token}`;
  await sendUpdateEmailVerification(newEmail, user.fullName, confirmationLink);

  return {
    message: `Sebuah link konfirmasi telah dikirim ke ${newEmail}. Silakan periksa email Anda untuk menyelesaikan perubahan.`,
  };
}

export async function confirmEmailUpdateService(token: string) {
  const decoded = jwt.verify(token, SECRET_KEY) as {
    userId: number;
    newEmail: string;
    type: string;
  };

  if (decoded.type !== "email_update") {
    throw new Error("Token tidak valid untuk aksi ini.");
  }

  await prisma.user.update({
    where: { id: decoded.userId },
    data: {
      email: decoded.newEmail,
    },
  });

  return { message: "Alamat email Anda telah diperbarui." };
}

export async function createPasswordService(userId: number, password: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new Error("User tidak ditemukan.");
  }
  if (user.password) {
    throw new Error("Akun ini tidak memiliki password");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });
}

export async function deleteProfilePictureService(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { profilePicture: true },
  });

  if (!user) throw new Error("User tidak ditemukan.");

  if (user.profilePicture) {
    await cloudinaryRemove(user.profilePicture);
  }

  return await prisma.user.update({
    where: { id: userId },
    data: { profilePicture: null },
    select: { id: true, profilePicture: true },
  });
}
