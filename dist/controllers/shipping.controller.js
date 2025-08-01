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
exports.getShippingCostController = void 0;
const shipping_service_1 = require("../services/shipping.service");
const getShippingCostController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { addressId } = req.body;
        if (!addressId) {
            res.status(400).json({ error: "addressId tidak boleh kosong." });
            return;
        }
        const shippingData = yield (0, shipping_service_1.calculateShippingCost)(userId, Number(addressId));
        res.status(200).json(shippingData);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
exports.getShippingCostController = getShippingCostController;
