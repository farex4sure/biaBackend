"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyResetPasswordToken = exports.verifyRefreshToken = exports.verifyAccessToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const http_status_codes_1 = require("http-status-codes");
// Function to verify a JWT token
const generateAccessToken = (user) => {
    return jsonwebtoken_1.default.sign(user, process.env.JWT_SECRET, { expiresIn: "1h" });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (user) => {
    return jsonwebtoken_1.default.sign(user, process.env.JWT_SECRET, { expiresIn: "7d" });
};
exports.generateRefreshToken = generateRefreshToken;
const verifyAccessToken = (token) => {
    return jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret');
};
exports.verifyAccessToken = verifyAccessToken;
const verifyRefreshToken = (token) => {
    return jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret');
};
exports.verifyRefreshToken = verifyRefreshToken;
const verifyResetPasswordToken = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        return decoded;
    }
    catch (error) {
        throw { status: http_status_codes_1.StatusCodes.UNAUTHORIZED, message: "Invalid or expired token" };
    }
};
exports.verifyResetPasswordToken = verifyResetPasswordToken;
