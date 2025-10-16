"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forgotPasswordController = exports.resendOtpController = exports.verifyOtpController = exports.registerController = exports.loginController = exports.refreshTokenController = void 0;
const auth_service_1 = require("../services/auth.service");
const refreshTokenController = async (req, res) => {
    const { refreshToken } = req.body;
    try {
        const result = await refreshToken(refreshToken);
        return res.status(200).json({
            responseSuccessful: true,
            responseMessage: "Refresh Token",
            responseBody: result
        });
    }
    catch (err) {
        const status = err.status || 500;
        const message = err.message || "Something went wrong";
        return res.status(status).json({
            responseSuccessful: false,
            responseMessage: message,
            responseBody: null,
        });
    }
};
exports.refreshTokenController = refreshTokenController;
const loginController = async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await (0, auth_service_1.login)(email, password);
        return res.status(200).json({
            responseSuccessful: true,
            responseMessage: "Login successful",
            responseBody: result
        });
    }
    catch (err) {
        const status = err.status || 500;
        const message = err.message || "Something went wrong";
        return res.status(status).json({
            responseSuccessful: false,
            responseMessage: message,
            responseBody: null,
        });
    }
};
exports.loginController = loginController;
const registerController = async (req, res) => {
    const { fullname, phone, email, password } = req.body;
    try {
        const result = await (0, auth_service_1.register)(fullname, phone, email, password);
        return res.status(200).json({
            responseSuccessful: true,
            responseMessage: "Registration successful, OTP has been successfully sent",
            responseBody: result
        });
    }
    catch (err) {
        const status = err.status || 500;
        const message = err.message || "Something went wrong";
        return res.status(status).json({
            responseSuccessful: false,
            responseMessage: message,
            responseBody: null,
        });
    }
};
exports.registerController = registerController;
const verifyOtpController = async (req, res) => {
    const { otp, email } = req.body;
    try {
        const result = await (0, auth_service_1.verifyOtp)(otp, email);
        return res.status(200).json({
            responseSuccessful: true,
            responseMessage: "OTP has been successfully verified",
            responseBody: result
        });
    }
    catch (err) {
        const status = err.status || 500;
        const message = err.message || "Something went wrong";
        return res.status(status).json({
            responseSuccessful: false,
            responseMessage: message,
            responseBody: null,
        });
    }
};
exports.verifyOtpController = verifyOtpController;
const resendOtpController = async (req, res) => {
    const { email } = req.body;
    try {
        const result = await (0, auth_service_1.resendOtp)(email);
        return res.status(200).json({
            responseSuccessful: true,
            responseMessage: "OTP has been successfully resent",
            responseBody: result
        });
    }
    catch (err) {
        const status = err.status || 500;
        const message = err.message || "Something went wrong";
        return res.status(status).json({
            responseSuccessful: false,
            responseMessage: message,
            responseBody: null,
        });
    }
};
exports.resendOtpController = resendOtpController;
const forgotPasswordController = async (req, res) => {
    const { email } = req.body;
    try {
        const result = await (0, auth_service_1.forgotPassword)(email);
        return res.status(200).json({
            responseSuccessful: true,
            responseMessage: "Email has been successfully sent",
            responseBody: result
        });
    }
    catch (err) {
        const status = err.status || 500;
        const message = err.message || "Something went wrong";
        return res.status(status).json({
            responseSuccessful: false,
            responseMessage: message,
            responseBody: null,
        });
    }
};
exports.forgotPasswordController = forgotPasswordController;
