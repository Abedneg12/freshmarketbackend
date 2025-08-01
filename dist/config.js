"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_STORE = exports.MIDTRANS_SERVER_KEY = exports.MIDTRANS_CLIENT_KEY = exports.OPENCAGE_KEY = exports.GOOGLE_SECRET = exports.GOOGLE_ID = exports.CLOUDINARY_SECRET = exports.CLOUDINARY_KEY = exports.CLOUDINARY_NAME = exports.NODEMAILER_PASS = exports.NODEMAILER_EMAIL = exports.FE_PORT = exports.JWT_SECRET = exports.PORT = void 0;
require("dotenv/config");
_a = process.env, exports.PORT = _a.PORT, exports.JWT_SECRET = _a.JWT_SECRET, exports.FE_PORT = _a.FE_PORT, exports.NODEMAILER_EMAIL = _a.NODEMAILER_EMAIL, exports.NODEMAILER_PASS = _a.NODEMAILER_PASS, exports.CLOUDINARY_NAME = _a.CLOUDINARY_NAME, exports.CLOUDINARY_KEY = _a.CLOUDINARY_KEY, exports.CLOUDINARY_SECRET = _a.CLOUDINARY_SECRET, exports.GOOGLE_ID = _a.GOOGLE_ID, exports.GOOGLE_SECRET = _a.GOOGLE_SECRET, exports.OPENCAGE_KEY = _a.OPENCAGE_KEY, exports.MIDTRANS_CLIENT_KEY = _a.MIDTRANS_CLIENT_KEY, exports.MIDTRANS_SERVER_KEY = _a.MIDTRANS_SERVER_KEY, exports.DEFAULT_STORE = _a.DEFAULT_STORE;
