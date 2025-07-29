import prisma from "../lib/prisma";

export const calculateShippingCost = async (
  storeId: number,
  addressId: number
) => {
  const store = await prisma.store.findUnique({ where: { id: storeId } });
  const address = await prisma.address.findUnique({
    where: { id: addressId },
  });
  if (!store || !address) {
    throw new Error("Toko atau alamat tidak ditemukan.");
  }

  const FLAT_RATE_SAME_CITY = 5000;
  const deliveryOptions = [];

  if (store.city.toLowerCase() === address.city.toLowerCase()) {
    deliveryOptions.push({
      service: "Pengiriman Dalam Kota",
      description: "Estimasi 1-3 jam",
      cost: FLAT_RATE_SAME_CITY,
    });
  } else {
    deliveryOptions.push({
      service: "Pengiriman Luar Kota",
      description: "Tidak tersedia saat ini",
      cost: 0,
    });
  }

  return deliveryOptions;
};
