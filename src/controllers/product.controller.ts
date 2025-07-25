// src/controllers/product.controller.ts

import { Request, Response, NextFunction } from "express";
import { createProduct, deleteProduct, getAllProducts, getProductById, updateProduct } from "../services/product.service";
import { ProductDTO } from "../interfaces/product.type";
import { updateProductStock } from "../services/inventory.service";
import { getProductsForStoreAdmin } from "../services/product.service";

export const getAllProductsController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const products = await getAllProducts();
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Failed to fetch products" });
    next(error);
  }
};
export const getProductsStoreAdminController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const adminUser = req.user;

    if (!adminUser) {
      res.status(401).json({ message: 'Unauthorized: Admin not found' });
      return;
    }

    const {
      page,
      limit,
      search,
      category,
    } = req.query;

    const result = await getProductsForStoreAdmin(adminUser, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: search as string | undefined,
      category: category as string | undefined,
    });

    res.status(200).json({
      message: 'Berhasil mengambil daftar produk untuk admin',
      ...result,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Gagal mengambil daftar produk', error: error.message });
    next(error);
  }
};


export const getProductByIdController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const productId = parseInt(req.params.productId);
  try {
    const product = await getProductById(productId);
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }
    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Failed to fetch product" });
    next(error);
  }
};

export const createProductController = async (req: Request, res: Response, next: NextFunction) => {
  const productData = {
    ...req.body,
    categoryId: Number(req.body.categoryId),
    basePrice: parseFloat(req.body.basePrice),
  };
  const newFiles = req.files as Express.Multer.File[]; // Multer will add this as 'images' field
  const storeAllocations = req.body.storeAllocations ? JSON.parse(req.body.storeAllocations) : []; // Parse store allocations

  try {
    const newProduct = await createProduct(productData, newFiles);

    // Handle initial stock allocations for a new product
    if (newProduct.id && storeAllocations.length > 0) {
      for (const allocation of storeAllocations) {
        await updateProductStock({ // Use updateProductStock from inventory service
          productId: newProduct.id,
          storeId: allocation.storeId,
          quantity: allocation.quantity,
          type: allocation.type || 'IN', // Default to 'IN' for new product
        });
      }
    }

    res.status(201).json(newProduct);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to create product" });
    next(error);
  }
};

export const updateProductController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const productId = parseInt(req.params.productId);
  if (isNaN(productId)) {
    res.status(400).json({ message: 'Invalid Product ID' });
    return;
  }

  // Parse basic product data
  const productData: Partial<ProductDTO> = {
    name: req.body.name,
    description: req.body.description,
    basePrice: req.body.basePrice ? parseFloat(req.body.basePrice) : undefined,
    categoryId: req.body.categoryId ? Number(req.body.categoryId) : undefined,
  };

  // Parse image-related data from JSON strings
  const imagesToDelete = req.body.imagesToDelete ? JSON.parse(req.body.imagesToDelete) : [];
  const newFiles = req.files as Express.Multer.File[]; // These are the 'images' files from Multer

  // Parse store allocations
  const storeAllocations = req.body.storeAllocations ? JSON.parse(req.body.storeAllocations) : [];

  try {
    const updatedProduct = await updateProduct(
      productId,
      productData,
      imagesToDelete,
      newFiles // Pass the files received from Multer
    );

    if (!updatedProduct) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    // Handle store stock adjustments separately using the inventory service
    if (storeAllocations.length > 0) {
      const adjustmentPromises = storeAllocations.map(async (allocation: StoreStock) => {
        await updateProductStock({ // Use updateProductStock from inventory service
          productId: productId,
          storeId: allocation.storeId,
          quantity: allocation.quantity,
          type: allocation.type,
        });
      });
      await Promise.all(adjustmentPromises);
    }

    res.status(200).json(updatedProduct);
  } catch (error: any) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: error.message || "Failed to update product" });
    next(error);
  }
};

export const deleteProductController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const productId = parseInt(req.params.productId);
  try {
    const deletedProduct = await deleteProduct(productId);
    if (!deletedProduct) {
      res.status(404).json({ message: "Product not found" });
      return;
    }
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Failed to delete product" });
    next(error);
  }
};

interface StoreStock {
  storeId: number;
  quantity: number;
  type: 'IN' | 'OUT';
}