import axios from "axios";
import { OPENCAGE_KEY } from "../config";

export async function geocodeAddress(address: string) {
  const key = OPENCAGE_KEY!;
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
    address
  )}&key=${key}`;
  const res = await axios.get(url);
  const { lat, lng } = res.data.results[0].geometry;
  return { lat, lng };
}
