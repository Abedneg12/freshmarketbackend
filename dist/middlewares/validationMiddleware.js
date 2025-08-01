"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = void 0;
const validateBody = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);
        console.log("Validating request body:", req.body);
        if (!result.success) {
            res.status(400).json({
                message: 'Validasi gagal',
                errors: result.error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message,
                })),
            });
            return;
        }
        req.body = result.data;
        next();
    };
};
exports.validateBody = validateBody;
