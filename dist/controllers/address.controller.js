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
exports.deleteAddressController = exports.updateAddressController = exports.createAddressController = exports.getAllAddressesController = void 0;
const address_service_1 = require("../services/address.service");
const getAllAddressesController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const addresses = yield (0, address_service_1.getAllAddresses)(userId);
        res.status(200).json(addresses);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getAllAddressesController = getAllAddressesController;
const createAddressController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const addressData = req.body;
        const newAddress = yield (0, address_service_1.createAddress)(userId, addressData);
        res.status(201).json(newAddress);
    }
    catch (error) {
        console.error("Error in createAddress controller:", error.message);
        res.status(400).json({ error: error.message });
    }
});
exports.createAddressController = createAddressController;
const updateAddressController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const addressId = parseInt(req.params.id, 10);
        const addressData = req.body;
        const updatedAddress = yield (0, address_service_1.updateAddress)(userId, addressId, addressData);
        res.status(200).json(updatedAddress);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.updateAddressController = updateAddressController;
const deleteAddressController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const addressId = parseInt(req.params.id, 10);
        const result = yield (0, address_service_1.deleteAddress)(userId, addressId);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
exports.deleteAddressController = deleteAddressController;
