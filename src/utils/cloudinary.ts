import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import * as streamifier from "streamifier";
import { CLOUDINARY_NAME, CLOUDINARY_KEY, CLOUDINARY_SECRET } from "../config";

cloudinary.config({
  cloud_name: CLOUDINARY_NAME || "",
  api_key: CLOUDINARY_KEY || "",
  api_secret: CLOUDINARY_SECRET || "",
});

export function cloudinaryUpload(
  file: Express.Multer.File
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      (err, res: UploadApiResponse) => {
        if (err) return reject(err);
        resolve(res);
      }
    );

    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  });
}

export function extractPublicIdFromUrl(url: string): string {
  try {
    const parts = url.split("/");
    const publicIdWithExt = parts[parts.length - 1];
    const publicId = publicIdWithExt.split(".")[0];
    return publicId;
  } catch (err) {
    throw new Error("Gagal mengekstrak public_id dari URL");
  }
}

export async function cloudinaryRemove(secure_url: string) {
  const publicId = extractPublicIdFromUrl(secure_url);
  return await cloudinary.uploader.destroy(publicId);
}
