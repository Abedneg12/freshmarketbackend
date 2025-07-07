import prisma from "../lib/prisma";
import { calculateDistanceKm } from "../utils/haversine";

export async function getRecommendedStores(lat: number, lng: number) {
  if (!lat || !lng) throw new Error("Lokasi tidak valid");

  const allStores = await prisma.store.findMany({
    include: {
      products: {
        include: {
          product: {
            include: {
              images: true,
            },
          },
        },
      },
    },
  });

  // filter dan hitung jarak ke toko
  const results = [];

  for (const store of allStores) {
    const dist = calculateDistanceKm(lat, lng, store.latitude, store.longitude);

    if (dist <= 7) {
      const products = store.products.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.basePrice,
        imageUrl: item.product.images?.[0]?.imageUrl ?? "",
        stock: item.quantity,
      }));

      results.push({
        id: store.id,
        name: store.name,
        address: store.address,
        distanceKm: parseFloat(dist.toFixed(2)),
        products,
      });
    }
  }

  return results;
}
