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
exports.geocodeAddress = geocodeAddress;
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config");
function geocodeAddress(address) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!config_1.OPENCAGE_KEY) {
                throw new Error("Opencage API key tidak ditemukan di .env");
            }
            const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=${config_1.OPENCAGE_KEY}`;
            const response = yield axios_1.default.get(url);
            if (!response.data.results || response.data.results.length === 0) {
                throw new Error("Tidak dapat menemukan koordinat untuk alamat yang diberikan.");
            }
            const { lat, lng } = response.data.results[0].geometry;
            return { lat, lng };
        }
        catch (error) { }
        throw new Error("Gagal melakukan geocoding alamat.");
    });
}
