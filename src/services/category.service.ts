import prisma from "../lib/prisma";

export const getAllCategories = async () => {
  try {
    return await prisma.productCategory.findMany({
      select: {
        id: true,
        name: true,
        products: {
          select: {
            id: true,
            name: true
          },
        }
      },
    });
  } catch (err) {
    console.error("Error fetching categories:", err);
    throw new Error("Failed to fetch categories");
  }
};

export const getCategoryById = async (categoryId: number) => {
  try {
    return await prisma.productCategory.findUnique({
      where: { id: categoryId },
      include: {
        products: true,
      },
    });
  } catch (err) {
    console.error("Error fetching category:", err);
    throw new Error("Failed to fetch category");
  }
};

export const createCategory = async (data: { name: string }) => {
  try {
    return await prisma.productCategory.create({
      data,
    });
  } catch (err) {
    console.error("Error creating category:", err);
    throw new Error("Failed to create category");
  }
};

export const updateCategory = async (
  categoryId: number,
  data: Partial<{ name: string }>
) => {
  try {
    return await prisma.productCategory.update({
      where: { id: categoryId },
      data,
    });
  } catch (err) {
    console.error("Error updating category:", err);
    throw new Error("Failed to update category");
  }
};

export const deleteCategory = async (categoryId: number) => {
  try {
    return await prisma.productCategory.delete({
      where: { id: categoryId },
    });
  } catch (err) {
    console.error("Error deleting category:", err);
    throw new Error("Failed to delete category");
  }
};