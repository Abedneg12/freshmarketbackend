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
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const config_1 = require("../config");
const client_1 = require("@prisma/client");
// Google
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: config_1.GOOGLE_ID,
    clientSecret: config_1.GOOGLE_SECRET,
    callbackURL: "http://localhost:8000/api/oauth/google/callback",
}, (_accessToken, _refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userProfile = {
            id: Number(profile.id),
            provider: "google",
            providerId: profile.id,
            email: (_a = profile.emails) === null || _a === void 0 ? void 0 : _a[0].value,
            displayName: profile.displayName,
            role: client_1.UserRole.USER,
            isVerified: true,
        };
        done(null, userProfile);
    }
    catch (error) {
        done(error, false);
    }
})));
exports.default = passport_1.default;
