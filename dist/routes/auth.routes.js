"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth.controller");
const authRoutes = express_1.default.Router();
authRoutes.post('/login', auth_controller_1.loginController);
authRoutes.post('/register', auth_controller_1.registerController);
authRoutes.post('/verify', auth_controller_1.verifyOtpController);
authRoutes.post('/resend', auth_controller_1.resendOtpController);
authRoutes.post('/forgot', auth_controller_1.forgotPasswordController);
authRoutes.post('/refresh-token', auth_controller_1.refreshTokenController);
exports.default = authRoutes;
