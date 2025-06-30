import { error } from "console";
import prisma from "../lib/prisma";
import bcrypt from 'bcrypt';

export const getAllUsers = async () => {
    try {
        return await prisma.user.findMany({
            where: {
                isVerified: true,
            },
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                isVerified: true,
                StoreAdminAssignment: {
                    select: {   
                        store: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
                addresses: {
                    select: {
                        city: true,
                        province: true,
                    },
                },
            },
        });
    } catch (err) {
        console.error("Error fetching users:", err);
        throw new Error("Failed to fetch users");
    }
}

export const createStoreAdmin = async (email: string, fullName: string, password: string) => {
    try {
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) throw new Error("User already exists");
        const hashedPassword = await bcrypt.hash(password, 10);
        return await prisma.user.create({
            data: {
                email,
                fullName,
                password: hashedPassword,
                role: 'STORE_ADMIN',
                isVerified: true,
            },
        });
    } catch (err) {
        console.error("Error creating store admin:", err);
        throw new Error("Failed to create store admin");
    }
}

export const assignStoreAdmin = async (userId: number, storeId: number) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new Error("User not found");
        const store = await prisma.store.findUnique({ where: { id: storeId } });
        if (!store) throw new Error("Store not found");
        const existing = await prisma.storeAdminAssignment.findFirst({
            where: { userId, storeId },
        });
        if (existing) throw new Error("User is already assigned to this store");
        return await prisma.$transaction(async (t: any) => {
            await t.user.update({   
                where: { id: userId },
                data: { role: 'STORE_ADMIN' },
            });
            await t.storeAdminAssignment.create({
                data: {
                    userId,
                    storeId,
                },
            });
        });
    } catch (err) {
        console.error("Error creating store admin:", err);
        throw new Error("Failed to create store admin");
    }
}

export const deleteStoreAdmin = async (userId: number) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true }
        });
        if (!user || user.role !== 'STORE_ADMIN') {
            throw new Error("User is not a store admin or does not exist");
        }
        return await prisma.user.delete({
            where: { id: userId },
        });
    } catch (err) {
        console.error("Error deleting user:", err);
        throw new Error("Failed to delete user");
    }
}

export const updateStoreAdminAssigment = async (userId: number, storeId: number) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new Error("User not found");
        const store = await prisma.store.findUnique({ where: { id: storeId } });
        if (!store) throw new Error("Store not found");
        return await prisma.storeAdminAssignment.update({
            where: { id: userId, storeId },
            data: {
                userId,
                storeId,
            },
        });
    } catch (err) {
        console.error("Error updating store admin:", err);
        throw new Error("Failed to update store admin");
    }
}

export const updateStoreAdmin = async (userId: number, data: Partial<{ email: string; fullName: string; password: string }>) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new Error("User not found");
        const updatedData: any = {};
        if (data.email) updatedData.email = data.email;
        if (data.fullName) updatedData.fullName = data.fullName;
        if (data.password) {
            updatedData.password = await bcrypt.hash(data.password, 10);
        }
        return await prisma.user.update({
            where: { id: userId },
            data: updatedData,
        });
    } catch (err) {
        console.error("Error updating store admin:", err);
        throw new Error("Failed to update store admin");
    }
}
