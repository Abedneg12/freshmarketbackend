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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStoreAdminAssigmentController = exports.updateStoreAdminController = exports.deleteStoreAdminController = exports.assignStoreAdminController = exports.createStoreAdminController = exports.getAllUsersController = void 0;
const super_admin_service_1 = require("../services/super.admin.service");
const getAllUsersController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield (0, super_admin_service_1.getAllUsers)();
        res.status(200).json(users);
    }
    catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Failed to fetch users" });
        next(error);
    }
});
exports.getAllUsersController = getAllUsersController;
const createStoreAdminController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, fullName, password, storeId } = req.body;
    try {
        const result = yield (0, super_admin_service_1.createStoreAdmin)(email, fullName, password, Number(storeId));
        res.status(201).json(result);
    }
    catch (error) {
        console.error("Error creating store admin:", error);
        res.status(500).json({ message: "Failed to create store admin" });
        next(error);
    }
});
exports.createStoreAdminController = createStoreAdminController;
const assignStoreAdminController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, storeId } = req.body;
    try {
        const result = yield (0, super_admin_service_1.assignStoreAdmin)(userId, Number(storeId));
        res.status(201).json(result);
    }
    catch (error) {
        console.error("Error creating store admin:", error);
        res.status(500).json({ message: "Failed to create store admin" });
        next(error);
    }
});
exports.assignStoreAdminController = assignStoreAdminController;
const deleteStoreAdminController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const result = yield (0, super_admin_service_1.deleteStoreAdmin)(Number(userId));
        res.status(200).json(result);
    }
    catch (error) {
        console.error("Error deleting store admin:", error);
        res.status(500).json({ message: "Failed to delete store admin" });
        next(error);
    }
});
exports.deleteStoreAdminController = deleteStoreAdminController;
const updateStoreAdminController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const _a = req.body, { storeId } = _a, data = __rest(_a, ["storeId"]);
    try {
        const result = yield (0, super_admin_service_1.updateStoreAdmin)(Number(userId), data, storeId ? Number(storeId) : undefined);
        res.status(200).json(result);
    }
    catch (error) {
        console.error("Error updating store admin:", error);
        res.status(500).json({ message: "Failed to update store admin" });
        next(error);
    }
});
exports.updateStoreAdminController = updateStoreAdminController;
const updateStoreAdminAssigmentController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, storeId } = req.body;
    try {
        const result = yield (0, super_admin_service_1.updateStoreAdminAssigment)(Number(userId), Number(storeId));
        res.status(200).json(result);
    }
    catch (error) {
        console.error("Error updating store admin assignment:", error);
        res.status(500).json({ message: "Failed to update store admin assignment" });
        next(error);
    }
});
exports.updateStoreAdminAssigmentController = updateStoreAdminAssigmentController;
