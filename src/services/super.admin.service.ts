// src/services/super.admin.service.ts

import prisma from "../lib/prisma";
import bcrypt from 'bcrypt';
import { UserRole } from "@prisma/client";

export const getAllUsers = async () => {
    try {
        return await prisma.user.findMany({
            where: {
                role: {
                    in: [UserRole.STORE_ADMIN, UserRole.SUPER_ADMIN, UserRole.USER]
                }
            },
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                isVerified: true,
                StoreAdminAssignment: {
                    select: {
                        storeId: true,
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

export const createStoreAdmin = async (
    email: string,
    fullName: string,
    password: string,
    storeIds: number[]
) => {
    try {
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) throw new Error("User already exists");

        const hashedPassword = await bcrypt.hash(password, 10);

        return await prisma.$transaction(async (t) => {
            const newUser = await t.user.create({
                data: {
                    email,
                    fullName,
                    password: hashedPassword,
                    role: UserRole.STORE_ADMIN,
                    isVerified: true,
                },
            });

            if (storeIds && storeIds.length > 0) {
                const existingStores = await t.store.findMany({
                    where: { id: { in: storeIds } },
                    select: { id: true }
                });
                const existingStoreIds = new Set(existingStores.map(s => s.id));

                const assignmentsData = storeIds
                    .filter(storeId => existingStoreIds.has(storeId))
                    .map(storeId => ({
                        userId: newUser.id,
                        storeId: storeId,
                    }));

                if (assignmentsData.length > 0) {
                    await t.storeAdminAssignment.createMany({
                        data: assignmentsData,
                        skipDuplicates: true,
                    });
                }
            }
            return newUser;
        });
    } catch (err: any) {
        console.error("Error creating store admin:", err);
        throw new Error(err.message || "Failed to create store admin");
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
                data: { role: UserRole.STORE_ADMIN },
            });
            await t.storeAdminAssignment.create({
                data: {
                    userId,
                    storeId,
                },
            });
        });
    } catch (err: any) {
        console.error("Error creating store admin:", err);
        throw new Error(err.message || "Failed to create store admin");
    }
}

export const deleteStoreAdmin = async (userId: number) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true }
        });
        if (!user || user.role !== UserRole.STORE_ADMIN) {
            throw new Error("User is not a store admin or does not exist");
        }
        await prisma.storeAdminAssignment.deleteMany({
            where: { userId: userId },
        });

        return await prisma.user.delete({
            where: { id: userId },
        });
    } catch (err: any) {
        console.error("Error deleting user:", err);
        throw new Error(err.message || "Failed to delete user");
    }
}

export const updateStoreAdminAssigment = async (userId: number, storeId: number) => {
    try {
        throw new Error("updateStoreAdminAssigment is deprecated or incorrectly implemented for multi-assignment.");
    } catch (err: any) {
        console.error("Error updating store admin assignment (old function):", err);
        throw new Error(err.message || "Failed to update store admin assignment (old function)");
    }
}

export const updateStoreAdmin = async (
    userId: number,
    data: Partial<{ email: string; fullName: string; password: string }>,
    newStoreIds: number[]
) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { StoreAdminAssignment: true },
        });

        if (!user) {
            throw new Error("User not found");
        }

        const updatedUserData: any = {};
        if (data.fullName) updatedUserData.fullName = data.fullName;
        if (data.password) {
            updatedUserData.password = await bcrypt.hash(data.password, 10);
        }

        return await prisma.$transaction(async (t) => {
            await t.user.update({
                where: { id: userId },
                data: updatedUserData,
            });

            const currentStoreIds = user.StoreAdminAssignment.map(a => a.storeId);
            const storeIdsToAdd = newStoreIds.filter(id => !currentStoreIds.includes(id));
            const storeIdsToRemove = currentStoreIds.filter(id => !newStoreIds.includes(id));

            if (storeIdsToRemove.length > 0) {
                await t.storeAdminAssignment.deleteMany({
                    where: {
                        userId: userId,
                        storeId: { in: storeIdsToRemove },
                    },
                });
            }

            if (storeIdsToAdd.length > 0) {
                const existingStores = await t.store.findMany({
                    where: { id: { in: storeIdsToAdd } },
                    select: { id: true }
                });
                const existingStoreIds = new Set(existingStores.map(s => s.id));

                const assignmentsData = storeIdsToAdd
                    .filter(storeId => existingStoreIds.has(storeId))
                    .map(storeId => ({
                        userId: userId,
                        storeId: storeId,
                    }));

                if (assignmentsData.length > 0) {
                    await t.storeAdminAssignment.createMany({
                        data: assignmentsData,
                        skipDuplicates: true,
                    });
                }
            }

            if (newStoreIds.length > 0 && user.role !== UserRole.STORE_ADMIN) {
                await t.user.update({
                    where: { id: userId },
                    data: { role: UserRole.STORE_ADMIN },
                });
            } else if (newStoreIds.length === 0 && user.role === UserRole.STORE_ADMIN) {
                await t.user.update({
                    where: { id: userId },
                    data: { role: UserRole.USER },
                });
            }

            return t.user.findUnique({
                where: { id: userId },
                include: { StoreAdminAssignment: { include: { store: true } } },
            });
        });
    } catch (err: any) {
        console.error("Error updating store admin:", err);
        throw new Error(err.message || "Failed to update store admin");
    }
}