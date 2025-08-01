"use strict";
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
exports.deleteStore = exports.updateStore = exports.createStore = exports.getAllStores = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const getAllStores = (page, limit) => __awaiter(void 0, void 0, void 0, function* () {
    const skip = (page - 1) * limit;
    const stores = yield prisma_1.default.store.findMany({
        skip: skip,
        take: limit,
        include: {
            admins: {
                select: {
                    user: {
                        select: { id: true, fullName: true },
                    },
                },
            },
        },
        orderBy: { id: "asc" },
    });
    const totalStores = yield prisma_1.default.store.count();
    return { stores, totalStores };
});
exports.getAllStores = getAllStores;
const createStore = (data) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.default.store.create({
        data: {
            name: data.name,
            address: data.address,
            city: data.city,
            latitude: data.latitude,
            longitude: data.longitude,
        },
    });
});
exports.createStore = createStore;
const updateStore = (storeId, data) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.default.store.update({
        where: { id: storeId },
        data: {
            name: data.name,
            address: data.address,
            city: data.city,
            latitude: data.latitude,
            longitude: data.longitude,
        },
    });
});
exports.updateStore = updateStore;
const deleteStore = (storeId) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma_1.default.storeAdminAssignment.deleteMany({
        where: { storeId: storeId },
    });
    return prisma_1.default.store.delete({
        where: { id: storeId },
    });
});
exports.deleteStore = deleteStore;
