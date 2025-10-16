import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';

// Function to verify a JWT token

export const generateAccessToken = (user: { id: number; phone: string }) => {
  return jwt.sign(user, process.env.JWT_SECRET!, { expiresIn:  "1h" });
};

export const generateRefreshToken = (user: { id: number; phone: string }) => {
  return jwt.sign(user, process.env.JWT_SECRET!, { expiresIn: "7d" });
};

export const verifyAccessToken = (token: string): any => {
  return jwt.verify(token, process.env.JWT_SECRET || 'secret');
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET || 'secret' );
};

export const verifyResetPasswordToken = (token: string) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: number };
        return decoded;
    } catch (error) {
        throw { status: StatusCodes.UNAUTHORIZED, message: "Invalid or expired token" };
    }
};
