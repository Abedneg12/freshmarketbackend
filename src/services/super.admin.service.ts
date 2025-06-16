import { error } from "console";
import prisma from "../lib/prisma";

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
                addresses: {
                    select: {
                        city: true,
                        state: true,
                    },
                },
            },
        });
    } catch (err) {
        console.error("Error fetching users:", err);
        throw new Error("Failed to fetch users");
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

export const updateStoreAdmin = async (userId: number, data: { fullname?: string; email?: string; role?: string; }) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true }
        });
        if (!user || user.role !== 'STORE_ADMIN') {
            throw new Error("User is not a store admin or does not exist");
        }
        return await prisma.user.update({
            where: { id: userId },
            data,
        });
    } catch (err) {
        console.error("Error updating user:", err);
        throw new Error("Failed to update user");
    }
}
