"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = __importDefault(require("../utils/passport"));
const oauthController_1 = require("../controllers/oauthController");
const router = (0, express_1.Router)();
// inisiasi OAuth
router.get("/google", passport_1.default.authenticate("google", { scope: ["profile", "email"] }));
// callback
router.get("/google/callback", passport_1.default.authenticate("google", { session: false }), oauthController_1.OAuthController);
exports.default = router;
