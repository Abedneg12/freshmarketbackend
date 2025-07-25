import prisma from "../lib/prisma";
import { calculateDistanceKm } from "../utils/haversine";
import { DEFAULT_STORE_ID } from "../config";

export async function getRecommendedStores(lat?: number, lng?: number) {
  if (!lat || !lng) {
    if (!DEFAULT_STORE_ID) {
      throw new Error("Toko default belum dikonfigurasi di server.");
    }

    const defaultStore = await prisma.store.findUnique({
      where: { id: Number(DEFAULT_STORE_ID) },
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

    if (!defaultStore) {
      return [];
    }

    const products = defaultStore.products.map((item) => ({
      id: item.product.id,
      name: item.product.name,
      price: item.product.basePrice,
      images: item.product.images?.[0]?.imageUrl ?? "",
      stock: item.quantity,
    }));

    return [
      {
        id: defaultStore.id,
        name: defaultStore.name,
        images: defaultStore.imageUrl,
        address: defaultStore.address,
        distanceKm: 0,
        products,
      },
    ];
  }

  if (!lat || !lng) throw new Error("Lokasi tidak valid.");

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
        imageUrl: store.imageUrl,
        address: store.address,
        distanceKm: parseFloat(dist.toFixed(2)),
        products,
      });
    }
  }

  return results;
}

export async function getAllStores() {
  const stores = await prisma.store.findMany();
  return stores;
}

export async function getStoreProducts(storeId: number) {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    include: {
      products: {
        include: {
          product: {
            include: {
              images: true,
              category: true,
            },
          },
        },
      },
    },
  });

  if (!store) throw new Error("Toko tidak ditemukan.");

  const products = store.products.map((item) => ({
    id: item.product.id,
    name: item.product.name,
    basePrice: item.product.basePrice,
    category: item.product.category,
    price: item.product.basePrice,
    images: item.product.images,
    stock: item.quantity,
  }));

  return {
    id: store.id,
    name: store.name,
    imageUrl: store.imageUrl,
    address: store.address,
    products,
  };
}

export async function getStoreById(storeId: number) {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    include: {
      products: {
        include: {
          product: {
            include: {
              images: true,
              category: true,
              discounts: true,
              stocks: true,
              cartItems: true,
              orderItems: true,
              InventoryJournal: true,
              Voucher: true,
            },
          },
        },
      },
      discounts: true,
      journals: true,
      orders: true,
      admins: true,
      carts: true,
    },
  });

  if (!store) throw new Error("Toko tidak ditemukan.");

  return store;
}