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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecommendations = getRecommendations;
exports.getAllStoresController = getAllStoresController;
exports.getStoreProductsController = getStoreProductsController;
exports.getStoreByIdController = getStoreByIdController;
const storeService_1 = require("../services/storeService");
function getRecommendations(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const lat = req.query.lat ? parseFloat(req.query.lat) : undefined;
            const lng = req.query.lng ? parseFloat(req.query.lng) : undefined;
            const data = yield (0, storeService_1.getRecommendedStores)(lat, lng);
            res.json(data);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    });
}
function getAllStoresController(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (0, storeService_1.getAllStores)();
            res.json(data);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    });
}
function getStoreProductsController(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const storeId = parseInt(req.params.storeId);
        if (isNaN(storeId)) {
            res.status(400).json({ error: "Invalid store ID" });
            return;
        }
        try {
            const data = yield (0, storeService_1.getStoreProducts)(storeId);
            res.json(data);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    });
}
function getStoreByIdController(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const storeId = parseInt(req.params.storeId);
        if (isNaN(storeId)) {
            res.status(400).json({ error: "Invalid store ID" });
            return;
        }
        try {
            const data = yield (0, storeService_1.getStoreById)(storeId);
            if (!data) {
                res.status(404).json({ error: "Store not found" });
                return;
            }
            res.json(data);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    });
}
