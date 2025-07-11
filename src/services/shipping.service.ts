import prisma from "../lib/prisma";
import { calculateDistanceKm } from "../utils/haversine";

const COST_PER_KM = 5000;
const MAX_DISTANCE_METERS = 7000;

export const calculateShippingCost = async (
  userId: number,
  addressId: number
) => {
  const address = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });
  if (!address) {
    throw new Error("Alamat tidak ditemukan atau bukan milik Anda.");
  }

  const cartItems = await prisma.cartItem.findMany({
    where: { cart: { userId } },
    include: { product: true },
  });
  if (cartItems.length === 0) {
    throw new Error(
      "Keranjang Anda kosong. Tidak dapat menghitung ongkos kirim."
    );
  }

  const stores = await prisma.store.findMany();
  let chosenStore = null;
  let shortestDistance = Infinity;

  for (const store of stores) {
    const distance = calculateDistanceKm(
      address.latitude,
      address.longitude,
      store.latitude,
      store.longitude
    );

    if (distance * 1000 <= MAX_DISTANCE_METERS) {
      let hasAllStock = true;
      for (const item of cartItems) {
        const stock = await prisma.stock.findFirst({
          where: { storeId: store.id, productId: item.productId },
        });
        if (!stock || stock.quantity < item.quantity) {
          hasAllStock = false;
          break;
        }
      }

      if (hasAllStock && distance < shortestDistance) {
        shortestDistance = distance;
        chosenStore = store;
      }
    }
  }

  if (!chosenStore) {
    throw new Error(
      "Mohon maaf, tidak ada toko terdekat yang dapat melayani semua pesanan Anda saat ini."
    );
  }
  const shippingCost = Math.ceil(shortestDistance) * COST_PER_KM;

  return {
    shippingCost,
    distanceKm: parseFloat(shortestDistance.toFixed(2)),
    store: {
      id: chosenStore.id,
      name: chosenStore.name,
    },
  };
};
