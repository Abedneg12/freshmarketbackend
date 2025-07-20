// src/services/product.service.ts

import { unlink } from 'fs/promises';
import path from "path";
import prisma from "../lib/prisma";
import { cloudinaryRemove, cloudinaryUpload } from '../utils/cloudinary';

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

    let imageRecords: { imageUrl: string }[] = [];
    if (newFiles && newFiles.length > 0) {
      for (const file of newFiles) {
        const uploadResult = await cloudinaryUpload(file);
        imageRecords.push({ imageUrl: uploadResult.secure_url });
      }
    }

    return await prisma.product.create({
      data: {
        ...data,
        images: imageRecords.length > 0
          ? { create: imageRecords }
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
  imagesToDelete: string[], // Array of imageUrl strings to delete
  files?: Express.Multer.File[] // New files being uploaded
) => {
  try {
    // Remove images from Cloudinary
    if (imagesToDelete.length > 0) {
      await prisma.productImage.deleteMany({
        where: {
          productId: productId,
          imageUrl: { in: imagesToDelete }
        }
      });

      for (const imageUrl of imagesToDelete) {
        try {
          await cloudinaryRemove(imageUrl);
        } catch (error) {
          console.error(`Failed to remove image from Cloudinary: ${imageUrl}`, error);
        }
      }
    }

    // Upload new images to Cloudinary
    const newImageRecords: { imageUrl: string }[] = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const uploadResult = await cloudinaryUpload(file);
        newImageRecords.push({ imageUrl: uploadResult.secure_url });
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
    const productToDelete = await prisma.product.findUnique({
      where: { id: productId },
      include: { images: true }
    });

    if (!productToDelete) {
      throw new Error("Product not found");
    }
    for (const image of productToDelete.images) {
      try {
        await cloudinaryRemove(image.imageUrl);
      } catch (error) {
        console.error(`Failed to remove image from Cloudinary: ${image.imageUrl}`, error);
      }
    }
    await prisma.productImage.deleteMany({
      where: { productId: productId }
    });
    // ...rest of your delete logic...
    return await prisma.product.delete({
      where: { id: productId },
    });
  } catch (err) {
    console.error("Error deleting product:", err);
    throw new Error(`Failed to delete product: ${err instanceof Error ? err.message : String(err)}`);
  }
};