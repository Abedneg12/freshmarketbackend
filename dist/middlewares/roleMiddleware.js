"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = void 0;
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized - user not authenticated' });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({ message: 'Forbidden - insufficient permissions' });
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
