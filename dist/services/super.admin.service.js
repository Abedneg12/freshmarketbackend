"use strict";
// src/services/super.admin.service.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStoreAdmin = exports.updateStoreAdminAssigment = exports.deleteStoreAdmin = exports.assignStoreAdmin = exports.createStoreAdmin = exports.getAllUsers = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const client_1 = require("@prisma/client");
const getAllUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield prisma_1.default.user.findMany({
            where: {
                role: {
                    in: [client_1.UserRole.STORE_ADMIN, client_1.UserRole.SUPER_ADMIN, client_1.UserRole.USER]
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
    }
    catch (err) {
        console.error("Error fetching users:", err);
        throw new Error("Failed to fetch users");
    }
});
exports.getAllUsers = getAllUsers;
const createStoreAdmin = (email, fullName, password, storeId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Creating store admin with email:", email, "and storeId:", storeId);
        const existingUser = yield prisma_1.default.user.findUnique({
            where: { email },
        });
        if (existingUser)
            throw new Error("User already exists");
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        return yield prisma_1.default.$transaction((t) => __awaiter(void 0, void 0, void 0, function* () {
            const newUser = yield t.user.create({
                data: {
                    email,
                    fullName,
                    password: hashedPassword,
                    role: client_1.UserRole.STORE_ADMIN,
                    isVerified: true,
                },
            });
            const store = yield t.store.findUnique({
                where: { id: storeId },
            });
            if (!store)
                throw new Error("Store not found");
            yield t.storeAdminAssignment.create({
                data: {
                    userId: newUser.id,
                    storeId,
                },
            });
            return newUser;
        }));
    }
    catch (err) {
        console.error("Error creating store admin:", err);
        throw new Error(err.message || "Failed to create store admin");
    }
});
exports.createStoreAdmin = createStoreAdmin;
const assignStoreAdmin = (userId, storeId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new Error("User not found");
        const store = yield prisma_1.default.store.findUnique({ where: { id: storeId } });
        if (!store)
            throw new Error("Store not found");
        const existing = yield prisma_1.default.storeAdminAssignment.findFirst({
            where: { userId },
        });
        if (existing)
            throw new Error("User already assigned to a store");
        return yield prisma_1.default.$transaction((t) => __awaiter(void 0, void 0, void 0, function* () {
            yield t.user.update({
                where: { id: userId },
                data: { role: client_1.UserRole.STORE_ADMIN },
            });
            yield t.storeAdminAssignment.create({
                data: {
                    userId,
                    storeId,
                },
            });
        }));
    }
    catch (err) {
        console.error("Error creating store admin:", err);
        throw new Error(err.message || "Failed to create store admin");
    }
});
exports.assignStoreAdmin = assignStoreAdmin;
const deleteStoreAdmin = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield prisma_1.default.user.findUnique({
            where: { id: userId },
            select: { role: true }
        });
        if (!user || user.role !== client_1.UserRole.STORE_ADMIN) {
            throw new Error("User is not a store admin or does not exist");
        }
        yield prisma_1.default.storeAdminAssignment.deleteMany({
            where: { userId: userId },
        });
        return yield prisma_1.default.user.delete({
            where: { id: userId },
        });
    }
    catch (err) {
        console.error("Error deleting user:", err);
        throw new Error(err.message || "Failed to delete user");
    }
});
exports.deleteStoreAdmin = deleteStoreAdmin;
const updateStoreAdminAssigment = (userId, storeId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        throw new Error("updateStoreAdminAssigment is deprecated or incorrectly implemented for multi-assignment.");
    }
    catch (err) {
        console.error("Error updating store admin assignment (old function):", err);
        throw new Error(err.message || "Failed to update store admin assignment (old function)");
    }
});
exports.updateStoreAdminAssigment = updateStoreAdminAssigment;
const updateStoreAdmin = (userId, data, storeId) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Updating store admin with data:", data, "and storeId:", storeId);
    try {
        const user = yield prisma_1.default.user.findUnique({
            where: { id: userId },
            include: { StoreAdminAssignment: true },
        });
        if (!user)
            throw new Error("User not found");
        const updatedUserData = {};
        if (data.email)
            updatedUserData.email = data.email;
        if (data.fullName)
            updatedUserData.fullName = data.fullName;
        if (data.password) {
            updatedUserData.password = yield bcrypt_1.default.hash(data.password, 10);
        }
        return yield prisma_1.default.$transaction((t) => __awaiter(void 0, void 0, void 0, function* () {
            if (Object.keys(updatedUserData).length > 0) {
                yield t.user.update({
                    where: { id: userId },
                    data: updatedUserData,
                });
            }
            if (storeId !== undefined && storeId !== null) {
                const store = yield t.store.findUnique({
                    where: { id: storeId },
                });
                if (!store)
                    throw new Error("Store not found");
                if (user.StoreAdminAssignment) {
                    yield t.storeAdminAssignment.update({
                        where: { userId: userId },
                        data: { storeId: storeId },
                    });
                }
                else {
                    yield t.storeAdminAssignment.create({
                        data: {
                            userId,
                            storeId,
                        },
                    });
                }
                if (user.role !== client_1.UserRole.STORE_ADMIN) {
                    yield t.user.update({
                        where: { id: userId },
                        data: { role: client_1.UserRole.STORE_ADMIN },
                    });
                }
            }
            else {
                if (user.StoreAdminAssignment) {
                    yield t.storeAdminAssignment.delete({
                        where: { userId: userId },
                    });
                }
                if (user.role === client_1.UserRole.STORE_ADMIN) {
                    yield t.user.update({
                        where: { id: userId },
                        data: { role: client_1.UserRole.USER },
                    });
                }
            }
            return yield t.user.findUnique({
                where: { id: userId },
                include: { StoreAdminAssignment: { include: { store: true } } },
            });
        }));
    }
    catch (err) {
        console.error("Error updating store admin:", err);
        throw new Error(err.message || "Failed to update store admin");
    }
});
exports.updateStoreAdmin = updateStoreAdmin;
