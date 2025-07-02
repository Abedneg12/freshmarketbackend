import { Request, Response, NextFunction } from "express";
import { createProduct, deleteProduct, getAllProducts, getProductById, updateProduct } from "../services/product.service";
import { ProductDTO } from "../interfaces/product.type";

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
  const productData = req.body;
  const files = req.files as Express.Multer.File[]; // Multer will add this
  try {
    const newProduct = await createProduct(productData, files);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: "Failed to create product" });
    next(error);
  }
};

export const updateProductController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const productId = parseInt(req.params.productId);
  const productData: Partial<ProductDTO> = req.body;
  const files = req.files as Express.Multer.File[];
  try {
    const updatedProduct = await updateProduct(productId, productData, files);
    if (!updatedProduct) {
      res.status(404).json({ message: "Product not found" });
      return;
    }
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: "Failed to update product" });
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