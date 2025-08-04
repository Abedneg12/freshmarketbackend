import { Request, Response } from "express";
import * as userService from "../services/userService";
import { IUserPayload } from "../interfaces/IUserPayload";
import { FE_PORT } from "../config";

export async function getProfileController(req: Request, res: Response) {
  try {
    const userProfile = await userService.getProfileService(
      req.user as IUserPayload
    );
    res.status(200).json({
      message: "Profil berhasil diambil",
      data: userProfile,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function updateProfileController(req: Request, res: Response) {
  try {
    const { fullName } = req.body;

    if (!fullName) {
      res.status(400).json({ error: "Nama lengkap tidak boleh kosong" });
    }

    const updatedUser = await userService.updateProfileService(
      (req.user as IUserPayload).id,
      fullName
    );

    res.status(200).json({
      message: "Profil berhasil diperbarui",
      data: updatedUser,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function changePasswordController(req: Request, res: Response) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: "Password lama dan baru wajib diisi" });
      return;
    }

    await userService.changePasswordService(
      (req.user as IUserPayload).id,
      currentPassword,
      newPassword
    );

    res.status(200).json({ message: "Password berhasil diubah" });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function updateProfilePictureController(
  req: Request,
  res: Response
) {
  try {
    if (!req.file) {
      res.status(400).json({ error: "Tidak ada file yang di unggah." });
      return;
    }
    const result = await userService.updateProfilePictureService(
      (req.user as IUserPayload).id,
      req.file
    );
    res
      .status(200)
      .json({ message: "Foto profil berhasil diperbarui", data: result });
  } catch (error: any) {
    console.error("[PROFILE PICTURE UPLOAD ERROR]:", error);
    res.status(500).json({ error: error.message });
  }
}

export async function requestEmailUpdateController(
  req: Request,
  res: Response
) {
  try {
    const userId = (req.user as IUserPayload).id;
    const { newEmail } = req.body;

    if (!newEmail) {
      res.status(400).json({ error: "Email baru tidak boleh kosong." });
      return;
    }
    const result = await userService.requestEmailUpdateService(
      userId,
      newEmail
    );
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function confirmEmailUpdateController(
  req: Request,
  res: Response
) {
  try {
    const { token } = req.query;

    if (!token || typeof token !== "string") {
      return res
        .status(400)
        .json({ error: "Token tidak valid atau tidak ada." });
    }
    await userService.confirmEmailUpdateService(token);
    return res.redirect(`${FE_PORT}/profile?email_update_success=true`);
  } catch (error: any) {
    const errorMessage = encodeURIComponent(
      error.message || "Konfirmasi email gagal"
    );
    return res.redirect(`${FE_PORT}/error?message=${errorMessage}`);
  }
}

export async function createPasswordController(req: Request, res: Response) {
  try {
    const userId = (req.user as IUserPayload).id;
    const { password } = req.body;

    if (!password) {
      res.status(400).json({ error: "Password tidak boleh kosong." });
      return;
    }
    await userService.createPasswordService(userId, password);
    res.status(200).json({ message: "Password berhasil dibuat." });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function deleteProfilePictureController(
  req: Request,
  res: Response
) {
  try {
    const userId = (req.user as IUserPayload).id;
    const result = await userService.deleteProfilePictureService(userId);
    res
      .status(200)
      .json({ message: "Foto profil berhasil dihapus", data: result });
  } catch (error: any) {
    console.error("[PROFILE PICTURE DELETE ERROR]:", error);
    res.status(500).json({ error: error.message });
  }
}
