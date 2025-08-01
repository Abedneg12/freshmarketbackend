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
exports.OAuthController = OAuthController;
const oauthService_1 = require("../services/oauthService");
const config_1 = require("../config");
function OAuthController(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const profile = req.user;
        try {
            const { token } = yield (0, oauthService_1.OAuthLogin)(profile);
            const redirectUrl = `${config_1.FE_PORT}/success?token=${token}`;
            return res.redirect(redirectUrl);
        }
        catch (error) {
            console.error("Error during OAuth login service:", error);
            const errorMessage = encodeURIComponent(error.message || "Unknown login error");
            const errorUrl = `${config_1.FE_PORT}/error?message=${errorMessage}`;
            return res.redirect(errorUrl);
        }
    });
}
