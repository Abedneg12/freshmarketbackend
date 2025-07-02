import prisma from '../lib/prisma';

export const addItemToCart = async (
  userId: number,
  storeId: number,
  productId: number,
  quantity: number
) => {
  const stock = await prisma.stock.findFirst({
    where: {
      storeId,
      productId,
    },
  });

  if (!stock) {
    throw new Error('Stok untuk produk ini di toko tersebut tidak tersedia');
  }

  let cart = await prisma.cart.findFirst({
    where: { userId, storeId },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId, storeId },
    });
  }

  const existingItem = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, productId },
  });

  const existingQuantity = existingItem?.quantity ?? 0;
  const totalRequested = existingQuantity + quantity;

  if (stock.quantity < totalRequested) {
    throw new Error('Stok tidak mencukupi untuk jumlah yang diminta');
  }

  if (existingItem) {
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: totalRequested },
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity },
    });
  }

  return getCart(userId);
};

export const getCart = async (userId: number) => {
  const carts = await prisma.cart.findMany({
    where: { userId },
    include: {
      store: true,
      items: {
        include: {
          product: {
            include: {
              images: true,
              discounts: true,
            },
          },
        },
      },
    },
  });
  return carts;
};

export const removeItem = async (userId: number, itemId: number) => {
  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: true },
  });

  if (!item || item.cart.userId !== userId) {
    throw new Error('Item not found or unauthorized');
  }

  await prisma.cartItem.delete({ where: { id: itemId } });
  return getCart(userId);
};

export const updateQuantity = async (
  userId: number,
  itemId: number,
  quantity: number
) => {
  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: {
      cart: true,
      product: true,
    },
  });

  if (!item || item.cart.userId !== userId) {
    throw new Error('Item tidak ditemukan atau tidak memiliki akses');
  }

  const stock = await prisma.stock.findFirst({
    where: {
      storeId: item.cart.storeId,
      productId: item.productId,
    },
  });

  if (!stock) {
    throw new Error('Stok produk tidak tersedia di toko ini');
  }

  if (quantity > stock.quantity) {
    throw new Error('Jumlah melebihi stok tersedia');
  }

  await prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity },
  });

  return getCart(userId);
};

export const clearCart = async (userId: number, storeId: number) => {
  const cart = await prisma.cart.findFirst({
    where: { userId, storeId },
  });

  if (!cart) return getCart(userId);

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  return getCart(userId);
};

export const getCartCount = async (userId: number) => {
  const carts = await prisma.cart.findMany({
    where: { userId },
    include: { items: true },
  });

  const totalQuantity = carts.reduce((sum, cart) => {
    return sum + cart.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
  }, 0);

  return totalQuantity;
};
