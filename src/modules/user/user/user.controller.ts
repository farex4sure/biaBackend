// controllers/auth.controller.ts
import { Request, Response } from "express";
import { AuthRequest } from '../../../middlewares/auth.middleware';
import { getProfile } from "./user.service";
import { StatusCodes } from "http-status-codes";

export const getProfileController = async (req: Request, res: Response): Promise<any> => {
  const userId = (req as AuthRequest).user?.id;

  if (!userId) {
    res.status(StatusCodes.UNAUTHORIZED).json({
      responseSuccessful: false,
      responseMessage: "Unauthorized",
      responseBody: null,
    });
    return;
  }

  try {
    const result = await getProfile(userId);

    res.status(StatusCodes.OK).json({
      responseSuccessful: true,
      responseMessage: "User profile successfully fetched",
      responseBody: result,
    });
  } catch (err: any) {
    const status = err.status || StatusCodes.INTERNAL_SERVER_ERROR;
    const message = err.message || "Something went wrong";

    res.status(status).json({
      responseSuccessful: false,
      responseMessage: message,
      responseBody: null,
    });
  }
};