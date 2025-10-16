import prisma from "../../../config/database";
import { StatusCodes } from "http-status-codes";
import Validator from "fastest-validator";
const v = new Validator();

export const getProfile = async (userId: number) => {
    const user = await prisma.users.findUnique({
        where: { id: userId }
    });

    if (!user) {
        throw { status: StatusCodes.NOT_FOUND, message: "User not found" };
    }

    return {
        user,
    };
};