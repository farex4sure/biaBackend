// controllers/auth.controller.ts
import { Request, Response } from "express";
import {
    login,
    register,
    verifyOtp,
    completeRegistration,
    resendOtp,
    forgotPassword,
    resetPassword,
} from "./auth.service";
import { StatusCodes } from "http-status-codes";
import { AuthRequest } from "../../../middlewares/auth.middleware";

export const loginController = async (req: Request, res: Response): Promise<any> => {
    try {
        const result = await login(req.body);
        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return res.status(StatusCodes.OK).json({
            responseSuccessful: true,
            responseMessage: "Login successful",
            responseBody: result
        });
    } catch (err: any) {
        const status = err.status || 500;
        const message = err.message || "Something went wrong";
        return res.status(status).json({
            responseSuccessful: false,
            responseMessage: message,
            responseBody: null,
        });
    }
};

export const registerController = async (req: Request, res: Response): Promise<any> => {
    try {
        const result = await register(req.body);
        return res.status(StatusCodes.OK).json({
            responseSuccessful: true,
            responseMessage: "Registration successful, OTP has been successfully sent",
            responseBody: result
        });
    } catch (err: any) {
        const status = err.status || 500;
        const message = err.message || "Something went wrong";
        return res.status(status).json({
            responseSuccessful: false,
            responseMessage: message,
            responseBody: null,
        });
    }
};

export const verifyOtpController = async (req: Request, res: Response): Promise<any> => {
    try {
        const result = await verifyOtp(req.body);
        return res.status(StatusCodes.OK).json({
            responseSuccessful: true,
            responseMessage: "OTP has been successfully verified",
            responseBody: result
        });
    } 
    catch (err: any) {
        const status = err.status || 500;
        const message = err.message || "Something went wrong";
        return res.status(status).json({
            responseSuccessful: false,
            responseMessage: message,
            responseBody: null,
        });
    }
};

export const completeRegistrationController = async (req: Request, res: Response): Promise<any> => {
    try {
        const userId = (req as AuthRequest).user?.id;
        if (!userId) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                responseSuccessful: false,
                responseMessage: "Unauthorized",
                responseBody: null
            });
        }
        const result = await completeRegistration(userId, req.body);
        return res.status(StatusCodes.OK).json({
            responseSuccessful: true,
            responseMessage: "Registration completed successfully",
            responseBody: result
        });
    } 
    catch (err: any) {
        const status = err.status || 500;
        const message = err.message || "Something went wrong";
        return res.status(status).json({
            responseSuccessful: false,
            responseMessage: message,
            responseBody: null,
        });
    }
};

export const resendOtpController = async (req: Request, res: Response): Promise<any> => {
    try {
        const result = await resendOtp(req.body);
        return res.status(StatusCodes.OK).json({
            responseSuccessful: true,
            responseMessage: "OTP has been successfully resent",
            responseBody: result
        });
    }
    catch (err: any) {
        const status = err.status || 500;
        const message = err.message || "Something went wrong";
        return res.status(status).json({
            responseSuccessful: false,
            responseMessage: message,
            responseBody: null,
        });
    }
};

export const forgotPasswordController = async (req: Request, res: Response): Promise<any> => {
    try {
        const result = await forgotPassword(req.body);
        return res.status(StatusCodes.OK).json({
            responseSuccessful: true,
            responseMessage: "Password reset OTP has been successfully sent",
            responseBody: result
        });
    }
    catch (err: any) {
        const status = err.status || 500;
        const message = err.message || "Something went wrong";
        return res.status(status).json({
            responseSuccessful: false,
            responseMessage: message,
            responseBody: null,
        });
    }
};

export const resetPasswordController = async (req: Request, res: Response): Promise<any> => {
    try {
        const result = await resetPassword(req.body);
        return res.status(StatusCodes.OK).json({
            responseSuccessful: true,
            responseMessage: "Password has been successfully reset",
            responseBody: result
        });
    }
    catch (err: any) {
        const status = err.status || 500;
        const message = err.message || "Something went wrong";
        return res.status(status).json({
            responseSuccessful: false,
            responseMessage: message,
            responseBody: null,
        });
    }
};