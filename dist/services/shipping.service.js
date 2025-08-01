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
exports.calculateShippingCost = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const calculateShippingCost = (storeId, addressId) => __awaiter(void 0, void 0, void 0, function* () {
    const store = yield prisma_1.default.store.findUnique({ where: { id: storeId } });
    const address = yield prisma_1.default.address.findUnique({
        where: { id: addressId },
    });
    if (!store || !address) {
        throw new Error("Toko atau alamat tidak ditemukan.");
    }
    const FLAT_RATE_SAME_CITY = 5000;
    const deliveryOptions = [];
    if (store.city.toLowerCase() === address.city.toLowerCase()) {
        deliveryOptions.push({
            service: "Pengiriman Dalam Kota",
            description: "Estimasi 1-3 jam",
            cost: FLAT_RATE_SAME_CITY,
        });
    }
    else {
        deliveryOptions.push({
            service: "Pengiriman Luar Kota",
            description: "Tidak tersedia saat ini",
            cost: 0,
        });
    }
    return deliveryOptions;
});
exports.calculateShippingCost = calculateShippingCost;
