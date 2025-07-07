// src/services/product.service.ts

import { unlink } from 'fs/promises';
import path from "path";
import prisma from "../lib/prisma";

export const getAllProducts = async () => {
  try {
    return await prisma.product.findMany({
      include: {
        category: true,
        images: true,
        stocks: {
          include: {
            store: true,
          },
        },
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
  newFiles?: Express.Multer.File[]
) => {
  try {
    const existing = await prisma.product.findFirst({
      where: { name: data.name }
    });
    if (existing) {
      throw new Error("Product name already exists");
    }

    return await prisma.product.create({
      data: {
        ...data,
        images: newFiles && newFiles.length > 0
          ? { create: newFiles.map(file => ({ imageUrl: `/products/${file.filename}` })) }
          : undefined,
      },
      include: {
        images: true,
      },
    });
  } catch (err) {
    console.error("Error creating product:", err);
    if (newFiles) {
      for (const file of newFiles) {
        try {
          await unlink(path.join(process.cwd(), 'public', 'products', file.filename));
        } catch (fileErr) {
          console.error(`Failed to clean up uploaded file: ${file.filename}`, fileErr);
        }
      }
    }
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
  imagesToDelete: string[], // Array of imageUrl strings to delete
  files?: Express.Multer.File[] // New files being uploaded
) => {
  try {
    
    if (imagesToDelete.length > 0) {
      await prisma.productImage.deleteMany({
        where: {
          productId: productId,
          imageUrl: {
            in: imagesToDelete
          }
        }
      });

      for (const imageUrl of imagesToDelete) {
        const filename = path.basename(imageUrl);
        const filePath = path.join(process.cwd(), 'public', 'products', filename);
        try {
          await unlink(filePath);
          console.log(`Successfully deleted image file: ${filePath}`);
        } catch (error: any) {
          if (error.code === 'ENOENT') {
            console.warn(`Attempted to delete non-existent file: ${filePath}`);
          } else {
            console.error(`Error deleting image file ${filePath}:`, error);
          }
        }
      }
    }

    const newImageRecords: { imageUrl: string }[] = [];
    if (files && files.length > 0) { // Renamed newFiles to files
      for (const file of files) {
        newImageRecords.push({ imageUrl: `/products/${file.filename}` });
      }
      if (newImageRecords.length > 0) {
        await prisma.productImage.createMany({
          data: newImageRecords.map(img => ({
            ...img,
            productId: productId,
          }))
        });
      }
    }

    return await prisma.product.update({
      where: { id: productId },
      data: {
        name: data.name,
        description: data.description,
        basePrice: data.basePrice,
        categoryId: data.categoryId,
      },
      include: {
        images: true, // Include updated images in the response
      },
    });
  } catch (err) {
    console.error("Error updating product:", err);
    if (files) {
      for (const file of files) {
        try {
          await unlink(path.join(process.cwd(), 'public', 'products', file.filename));
        } catch (fileErr) {
          console.error(`Failed to clean up newly uploaded file after error: ${file.filename}`, fileErr);
        }
      }
    }
    throw new Error("Failed to update product");
  }
};

export const deleteProduct = async (productId: number) => {
  try {
    const productToDelete = await prisma.product.findUnique({
      where: { id: productId },
      include: { images: true }
    });

    if (!productToDelete) {
      throw new Error("Product not found");
    }
    for (const image of productToDelete.images) {
      const filename = path.basename(image.imageUrl);
      // Adjust this path to where your actual product images are stored
      const filePath = path.join(process.cwd(), 'public', 'products', filename);
      try {
        await unlink(filePath);
        console.log(`Successfully deleted physical image file: ${filePath}`);
      } catch (error: any) {
        if (error.code === 'ENOENT') {
          console.warn(`Attempted to delete non-existent file during product deletion: ${filePath}`);
        } else {
          console.error(`Error deleting physical image file ${filePath}:`, error);
        }
      }
    }
    await prisma.productImage.deleteMany({
      where: { productId: productId }
    });
    await prisma.stock.deleteMany({
        where: { productId: productId }
    });
    await prisma.cartItem.deleteMany({
        where: { productId: productId }
    });
    await prisma.inventoryJournal.deleteMany({
        where: { productId: productId }
    });
    await prisma.orderItem.deleteMany({
        where: { productId: productId }
    });

    // 5. Finally, delete the Product record
    return await prisma.product.delete({
      where: { id: productId },
    });
  } catch (err) {
    console.error("Error deleting product:", err);
    throw new Error(`Failed to delete product: ${err instanceof Error ? err.message : String(err)}`);
  }
};