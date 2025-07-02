import { Request, Response } from "express";
import * as userService from "../services/userService";
import { IUserPayload } from "../interfaces/IUserPayload";

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
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      res.status(400).json({ error: "Password lama dan baru wajib diisi" });
      return;
    }

    await userService.changePasswordService(
      (req.user as IUserPayload).id,
      oldPassword,
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
      res.status(400).json({ error: "Token tidak valid atau tidak ada." });
      return;
    }
    const result = await userService.confirmEmailUpdateService(token);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
