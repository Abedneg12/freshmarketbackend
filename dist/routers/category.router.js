"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const category_controller_1 = require("../controllers/category.controller");
const authOnlyMiddleware_1 = require("../middlewares/authOnlyMiddleware");
const client_1 = require("@prisma/client");
const roleMiddleware_1 = require("../middlewares/roleMiddleware");
const router = express_1.default.Router();
router.get("/", category_controller_1.getAllCategoriesController);
router.get("/:categoryId", category_controller_1.getCategoryByIdController);
router.post("/", authOnlyMiddleware_1.authOnlyMiddleware, (0, roleMiddleware_1.requireRole)([client_1.UserRole.SUPER_ADMIN]), category_controller_1.createCategoryController);
router.put("/:categoryId", authOnlyMiddleware_1.authOnlyMiddleware, (0, roleMiddleware_1.requireRole)([client_1.UserRole.SUPER_ADMIN]), category_controller_1.updateCategoryController);
router.delete("/:categoryId", authOnlyMiddleware_1.authOnlyMiddleware, (0, roleMiddleware_1.requireRole)([client_1.UserRole.SUPER_ADMIN]), category_controller_1.deleteCategoryController);
exports.default = router;
