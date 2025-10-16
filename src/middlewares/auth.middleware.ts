import { Request, Response, NextFunction, RequestHandler } from 'express';
import { verifyAccessToken } from '../utils/jwt.util';
import { StatusCodes } from "http-status-codes";


export interface AuthRequest extends Request {
  user?: { id: number };
}

export const authenticate: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw { status: StatusCodes.UNAUTHORIZED, message: "Access denied. No token provided." };
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);
    (req as AuthRequest).user = { id: decoded.id };
    next();
  } catch (error) {
    throw { status: StatusCodes.UNAUTHORIZED, message: "Invalid or expired token." };
  }
};
