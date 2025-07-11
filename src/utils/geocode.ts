import axios from "axios";
import { OPENCAGE_KEY } from "../config";

export async function geocodeAddress(address: string) {
  try {
    if (!OPENCAGE_KEY) {
      throw new Error("Opencage API key tidak ditemukan di .env");
    }

    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
      address
    )}&key=${OPENCAGE_KEY}`;
    const response = await axios.get(url);
    if (!response.data.results || response.data.results.length === 0) {
      throw new Error(
        "Tidak dapat menemukan koordinat untuk alamat yang diberikan."
      );
    }

    const { lat, lng } = response.data.results[0].geometry;
    return { lat, lng };
  } catch (error: any) {}
  throw new Error("Gagal melakukan geocoding alamat.");
}
