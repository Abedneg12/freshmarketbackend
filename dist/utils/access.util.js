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
exports.getAccessibleStoreIds = getAccessibleStoreIds;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../lib/prisma"));
function getAccessibleStoreIds(adminUser, requestedStoreId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (adminUser.role === client_1.UserRole.SUPER_ADMIN) {
            // Super Admins can access all stores (undefined) or a specific one if requested.
            return requestedStoreId ? [requestedStoreId] : undefined;
        }
        else if (adminUser.role === client_1.UserRole.STORE_ADMIN) {
            const assignments = yield prisma_1.default.storeAdminAssignment.findMany({
                where: { userId: adminUser.id },
                select: { storeId: true },
            });
            const assignedStoreIds = assignments.map(a => a.storeId);
            if (requestedStoreId && !assignedStoreIds.includes(requestedStoreId)) {
                throw new Error('Forbidden: Anda tidak memiliki akses ke toko ini.');
            }
            return assignedStoreIds.length > 0 ? assignedStoreIds : [0]; // Return [0] to ensure no data if no assignments
        }
        return [0]; // Default to no access for other roles
    });
}
