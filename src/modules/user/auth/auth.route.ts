import express from 'express';
import {
    loginController,
    registerController,
    verifyOtpController,
    resendOtpController,
    forgotPasswordController,
    resetPasswordController,
    completeRegistrationController,
} from './auth.controller';
import { authenticate } from '../../../middlewares/auth.middleware';

const authRoutes = express.Router();

authRoutes.post('/login', loginController);
authRoutes.post('/register', registerController);
authRoutes.post('/verify/otp', verifyOtpController);
authRoutes.post('/complete/registration', authenticate, completeRegistrationController);
authRoutes.post('/resend/otp', resendOtpController);
authRoutes.post('/forgot/password', forgotPasswordController);
authRoutes.post('/reset/password', resetPasswordController);

export default authRoutes;