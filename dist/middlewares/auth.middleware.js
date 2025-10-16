"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jwt_util_1 = require("../utils/jwt.util");
const http_status_codes_1 = require("http-status-codes");
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw { status: http_status_codes_1.StatusCodes.UNAUTHORIZED, message: "Access denied. No token provided." };
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = (0, jwt_util_1.verifyAccessToken)(token);
        req.user = { id: decoded.id };
        next();
    }
    catch (error) {
        throw { status: http_status_codes_1.StatusCodes.UNAUTHORIZED, message: "Invalid or expired token." };
    }
};
exports.authenticate = authenticate;
