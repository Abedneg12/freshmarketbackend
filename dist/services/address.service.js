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
exports.deleteAddress = exports.updateAddress = exports.createAddress = exports.getAllAddresses = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const geocode_1 = require("../utils/geocode");
const getAllAddresses = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const addresses = yield prisma_1.default.address.findMany({
        where: { userId },
        orderBy: { isMain: "desc" },
    });
    return addresses;
});
exports.getAllAddresses = getAllAddresses;
const createAddress = (userId, addressData) => __awaiter(void 0, void 0, void 0, function* () {
    const fullAddress = `${addressData.addressLine}, ${addressData.city}, ${addressData.province}, ${addressData.postalCode}`;
    let lat = 0;
    let lng = 0;
    try {
        // Bungkus pemanggilan geocode dalam try...catch
        const coordinates = yield (0, geocode_1.geocodeAddress)(fullAddress);
        lat = coordinates.lat;
        lng = coordinates.lng;
    }
    catch (error) {
        // Jika geocode gagal (misal: alamat tidak ditemukan, API key salah),
        // lempar error yang jelas.
        console.error("Geocoding failed:", error);
        throw new Error("Gagal memvalidasi lokasi dari alamat yang diberikan.");
    }
    if (addressData.isMain) {
        yield prisma_1.default.address.updateMany({
            where: { userId, isMain: true },
            data: { isMain: false },
        });
    }
    const newAddress = yield prisma_1.default.address.create({
        data: {
            userId: userId,
            label: addressData.label,
            recipient: addressData.recipient,
            phone: addressData.phone,
            addressLine: addressData.addressLine,
            city: addressData.city,
            province: addressData.province,
            postalCode: addressData.postalCode,
            isMain: addressData.isMain || false,
            latitude: lat,
            longitude: lng,
        },
    });
    return newAddress;
});
exports.createAddress = createAddress;
const updateAddress = (userId, addressId, addressData) => __awaiter(void 0, void 0, void 0, function* () {
    const address = yield prisma_1.default.address.findFirst({
        where: {
            id: addressId,
            userId: userId,
        },
    });
    if (!address) {
        throw new Error("Alamat tidak ditemukan atau Anda tidak punya akses.");
    }
    if (addressData.isMain) {
        yield prisma_1.default.address.updateMany({
            where: { userId: userId },
            data: { isMain: false },
        });
    }
    const updatedAddress = yield prisma_1.default.address.update({
        where: { id: addressId },
        data: addressData,
    });
    return updatedAddress;
});
exports.updateAddress = updateAddress;
const deleteAddress = (userId, addressId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.address.deleteMany({
        where: {
            id: addressId,
            userId: userId,
        },
    });
    if (result.count === 0) {
        throw new Error("Alamat tidak ditemukan atau Anda tidak punya akses.");
    }
    return { message: "Alamat berhasil dihapus." };
});
exports.deleteAddress = deleteAddress;
