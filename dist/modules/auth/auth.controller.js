"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordController = exports.forgotPasswordController = exports.resendOtpController = exports.verifyOtpController = exports.registerController = exports.loginController = exports.refreshTokenController = void 0;
const auth_service_1 = require("./auth.service");
const jwt_util_1 = require("../../utils/jwt.util");
const refreshTokenController = async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;
    try {
        const result = await (0, auth_service_1.getRefreshToken)(refreshToken);
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
        const { user, accessToken, refreshToken } = await (0, auth_service_1.login)(email, password);
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true, // Must be true for HTTPS (production)
            sameSite: 'none', // Required for cross-origin
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            domain: undefined // Don't set domain for cross-origin cookies
        });
        return res.status(200).json({
            responseSuccessful: true,
            responseMessage: "Login successful",
            responseBody: { user, accessToken, refreshToken }
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
        const { user, accessToken, refreshToken } = await (0, auth_service_1.verifyOtp)(otp, email);
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            //   secure: process.env.NODE_ENV === 'production',
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        return res.status(200).json({
            responseSuccessful: true,
            responseMessage: "OTP has been successfully verified",
            responseBody: { user, accessToken, refreshToken }
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
const resetPasswordController = async (req, res) => {
    const { token, newPassword, confirmNewPassword } = req.body;
    try {
        const decoded = (0, jwt_util_1.verifyResetPasswordToken)(token);
        const result = await (0, auth_service_1.resetPassword)(decoded.id, newPassword, confirmNewPassword);
        res.status(200).json({
            responseSuccessful: true,
            responseMessage: "Password has been successfully reset",
            responseBody: result
        });
    }
    catch (err) {
        const status = err.status || 500;
        const message = err.message || "Something went wrong";
        res.status(status).json({
            responseSuccessful: false,
            responseMessage: message,
            responseBody: null,
        });
    }
};
exports.resetPasswordController = resetPasswordController;
