"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteStoreController = exports.updateStoreController = exports.createStoreController = exports.getAllStoresController = void 0;
const storeService = __importStar(require("../services/store.service"));
const getAllStoresController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const { stores, totalStores } = yield storeService.getAllStores(page, limit);
        res.status(200).json({
            data: stores,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalStores / limit),
                totalStores: totalStores,
            },
        });
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Gagal mengambil data toko", error: error.message });
    }
});
exports.getAllStoresController = getAllStoresController;
const createStoreController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newStore = yield storeService.createStore(req.body, req.file);
        res.status(201).json(newStore);
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Gagal membuat toko baru", error: error.message });
    }
});
exports.createStoreController = createStoreController;
const updateStoreController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const storeId = parseInt(req.params.storeId, 10);
        const updatedStore = yield storeService.updateStore(storeId, req.body, req.file);
        res.status(200).json(updatedStore);
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Gagal memperbarui toko", error: error.message });
    }
});
exports.updateStoreController = updateStoreController;
const deleteStoreController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const storeId = parseInt(req.params.storeId, 10);
        yield storeService.deleteStore(storeId);
        res.status(200).json({ message: "Toko berhasil dihapus." });
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Gagal menghapus toko", error: error.message });
    }
});
exports.deleteStoreController = deleteStoreController;
