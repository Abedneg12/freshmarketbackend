"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const inventory_controller_1 = require("../controllers/inventory.controller");
const authOnlyMiddleware_1 = require("../middlewares/authOnlyMiddleware");
const roleMiddleware_1 = require("../middlewares/roleMiddleware");
const client_1 = require("@prisma/client");
const validationMiddleware_1 = require("../middlewares/validationMiddleware");
const inventory_validation_1 = require("../validations/inventory.validation");
const router = express_1.default.Router();
router.post("/stock", (0, validationMiddleware_1.validateBody)(inventory_validation_1.updateProductStockSchema), authOnlyMiddleware_1.authOnlyMiddleware, (0, roleMiddleware_1.requireRole)([client_1.UserRole.SUPER_ADMIN]), inventory_controller_1.updateProductStockController);
router.get("/journal", authOnlyMiddleware_1.authOnlyMiddleware, (0, roleMiddleware_1.requireRole)([client_1.UserRole.SUPER_ADMIN]), inventory_controller_1.getInventoryJournalController);
exports.default = router;
