import prisma from "../lib/prisma";

export const getAllProducts = async () => {
  try {
    return await prisma.product.findMany({
      include: {
        category: true,
        images: true,
        stocks: true,
        discounts: true,
        cartItems: true,
        orderItems: true,
        InventoryJournal: true,
        Voucher: true,
      },
    });
  } catch (err) {
    console.error("Error fetching products:", err);
    throw new Error("Failed to fetch products");
  }
};

export const getProductById = async (productId: number) => {
  try {
    return await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        images: true,
        stocks: true,
        discounts: true,
        cartItems: true,
        orderItems: true,
        InventoryJournal: true,
        Voucher: true,
      },
    });
  } catch (err) {
    console.error("Error fetching product:", err);
    throw new Error("Failed to fetch product");
  }
};

export const createProduct = async (
  data: {
    name: string;
    description: string;
    basePrice: number;
    categoryId: number;
  },
  files?: Express.Multer.File[]
) => {
  try {
    return await prisma.product.create({
      data: {
        ...data,
        images: files && files.length > 0
          ? { create: files.map(file => ({ imageUrl: `/products/${file.filename}` })) }
          : undefined,
      },
      include: {
        images: true,
      },
    });
  } catch (err) {
    console.error("Error creating product:", err);
    throw new Error("Failed to create product");
  }
};

export const updateProduct = async (
  productId: number,
  data: Partial<{
    name: string;
    description: string;
    basePrice: number;
    categoryId: number;
  }>,
  files?: Express.Multer.File[]
) => {
  try {
    let updateData: any = { ...data };
    if (files && files.length > 0) {
      // Remove old images and add new ones
      await prisma.productImage.deleteMany({ where: { productId } });
      updateData.images = { create: files.map(file => ({ imageUrl: `/products/${file.filename}` })) };
    }
    return await prisma.product.update({
      where: { id: productId },
      data: updateData,
      include: {
        images: true,
      },
    });
  } catch (err) {
    console.error("Error updating product:", err);
    throw new Error("Failed to update product");
  }
};

export const deleteProduct = async (productId: number) => {
  try {
    return await prisma.product.delete({
      where: { id: productId },
    });
  } catch (err) {
    console.error("Error deleting product:", err);
    throw new Error("Failed to delete product");
  }
};