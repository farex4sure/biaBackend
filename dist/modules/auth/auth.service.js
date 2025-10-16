"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.resendOtp = exports.verifyOtp = exports.register = exports.login = exports.getRefreshToken = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const database_1 = __importDefault(require("../../config/database"));
const jwt_util_1 = require("../../utils/jwt.util");
const http_status_codes_1 = require("http-status-codes");
const fastest_validator_1 = __importDefault(require("fastest-validator"));
const ioredis_1 = __importDefault(require("ioredis"));
const nodemailer_helper_1 = require("../../utils/helpers/nodemailer.helper");
const v = new fastest_validator_1.default();
const redis = new ioredis_1.default({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    connectTimeout: 10000,
});
redis.on('error', (err) => {
    console.error('Redis connection error:', err);
});
redis.on('connect', () => {
    console.log('Successfully connected to Redis');
});
const otpTTL = 300;
const getRefreshToken = async (refreshToken) => {
    const token = refreshToken;
    if (!token)
        throw { status: http_status_codes_1.StatusCodes.UNAUTHORIZED, message: "you are not authorized" };
    try {
        const payload = (0, jwt_util_1.verifyRefreshToken)(token);
        // Optionally: check if token exists in DB/Redis for extra security
        const isValid = await database_1.default.users.findFirst({
            where: { refreshToken: token }
        });
        if (!isValid) {
            throw {
                status: http_status_codes_1.StatusCodes.FORBIDDEN,
                message: "Invalid refresh token"
            };
        }
        const newAccessToken = (0, jwt_util_1.generateAccessToken)({ id: payload.id, email: payload.email });
        const newRefreshToken = (0, jwt_util_1.generateRefreshToken)({ id: payload.id, email: payload.email });
        await database_1.default.users.update({
            where: { id: isValid.id },
            data: {
                refreshToken: newRefreshToken
            }
        });
        return {
            accessToken: newAccessToken
        };
    }
    catch (err) {
        throw {
            status: http_status_codes_1.StatusCodes.FORBIDDEN,
            message: "Invalid or expired refresh token"
        };
    }
};
exports.getRefreshToken = getRefreshToken;
const login = async (email, password) => {
    const schema = {
        email: { type: "email", empty: false },
        password: { type: "string", min: 6, empty: false },
    };
    const validationResponse = await v.validate({ email, password }, schema);
    if (validationResponse !== true) {
        const message = validationResponse.map((err) => err.message).join(", ");
        throw {
            status: http_status_codes_1.StatusCodes.BAD_REQUEST,
            message,
            errors: validationResponse,
        };
    }
    const user = await database_1.default.users.findUnique({
        where: { email }
    });
    if (!user) {
        throw { status: http_status_codes_1.StatusCodes.NOT_FOUND, message: "Invalid login credentials" };
    }
    const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
    if (!isPasswordValid) {
        throw { status: http_status_codes_1.StatusCodes.UNAUTHORIZED, message: "Invalid login credentials" };
    }
    if (!user.email) {
        throw { status: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message: "User email is missing" };
    }
    const accessToken = (0, jwt_util_1.generateAccessToken)({
        id: user.id,
        email: user.email,
    });
    const refreshToken = (0, jwt_util_1.generateRefreshToken)({
        id: user.id,
        email: user.email,
    });
    const business = await database_1.default.businesses.findFirst({
        where: { userId: user.id },
        include: {
            store: true
        }
    });
    await database_1.default.users.update({
        where: { id: user.id },
        data: { refreshToken },
    });
    return {
        user,
        business,
        accessToken,
        refreshToken
    };
};
exports.login = login;
const register = async (fullname, phone, email, password) => {
    const schema = {
        fullname: { type: "string", empty: false },
        phone: { type: "string", empty: false },
        email: { type: "email", empty: false },
        password: { type: "string", min: 6, empty: false },
    };
    const validationResponse = await v.validate({ fullname, phone, email, password }, schema);
    if (validationResponse !== true) {
        const message = validationResponse.map((err) => err.message).join(", ");
        throw {
            status: http_status_codes_1.StatusCodes.BAD_REQUEST,
            message,
            errors: validationResponse,
        };
    }
    const user = await database_1.default.users.findUnique({
        where: { email }
    });
    if (user) {
        throw { status: http_status_codes_1.StatusCodes.BAD_REQUEST, message: "Email already exist" };
    }
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    try {
        // Clear any existing user or OTP entry
        await Promise.all([
            redis.del(`user:${email}`),
            redis.del(`otp:${email}`)
        ]);
        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000);
        const userPayload = {
            fullname,
            phone,
            email,
            password: hashedPassword,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        // Save OTP and user data to Redis with 5 minutes expiry
        await Promise.all([
            redis.set(`otp:${email}`, otp.toString(), "EX", otpTTL),
            redis.set(`user:${email}`, JSON.stringify(userPayload))
        ]);
        await (0, nodemailer_helper_1.otpMailer)(email, otp.toString(), fullname);
        return;
    }
    catch (error) {
        console.log('Redis operation failed:', error);
        throw {
            status: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR,
            message: "Failed to process registration. Please try again later."
        };
    }
};
exports.register = register;
const verifyOtp = async (otp, email) => {
    const schema = {
        otp: { type: "string", empty: false },
        email: { type: "email", empty: false },
    };
    const validationResponse = await v.validate({ otp, email }, schema);
    if (validationResponse !== true) {
        const message = validationResponse.map((err) => err.message).join(", ");
        throw {
            status: http_status_codes_1.StatusCodes.BAD_REQUEST,
            message,
            errors: validationResponse,
        };
    }
    // Fetch from Redis
    const userData = await redis.get(`user:${email}`);
    const userOtp = await redis.get(`otp:${email}`);
    if (!userData) {
        throw { status: http_status_codes_1.StatusCodes.NOT_FOUND, message: "User data not found" };
    }
    if (!userOtp) {
        throw { status: http_status_codes_1.StatusCodes.GONE, message: "OTP has expired. Please request a new one." };
    }
    if (otp !== userOtp) {
        throw { status: http_status_codes_1.StatusCodes.BAD_REQUEST, message: "Invalid OTP" };
    }
    const user = JSON.parse(userData);
    // Check again if user already exists in DB (just in case)
    const userExists = await database_1.default.users.findUnique({ where: { email } });
    if (userExists) {
        throw { status: http_status_codes_1.StatusCodes.CONFLICT, message: "User already registered" };
    }
    const newUser = await database_1.default.users.create({
        data: {
            fullname: user.fullname,
            phone: user.phone,
            email: user.email,
            password: user.password,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
    });
    // Generate tokens
    const accessToken = (0, jwt_util_1.generateAccessToken)({
        id: newUser.id,
        email: newUser.email
    });
    const refreshToken = (0, jwt_util_1.generateRefreshToken)({
        id: newUser.id,
        email: newUser.email
    });
    await database_1.default.users.update({
        where: { id: newUser.id },
        data: { refreshToken },
    });
    // Cleanup
    await redis.del(`user:${email}`);
    await redis.del(`otp:${email}`);
    return {
        user: newUser,
        refreshToken,
        accessToken
    };
};
exports.verifyOtp = verifyOtp;
const resendOtp = async (email) => {
    const schema = {
        email: { type: "email", empty: false },
    };
    const validationResponse = await v.validate({ email }, schema);
    if (validationResponse !== true) {
        const message = validationResponse.map((err) => err.message).join(", ");
        throw {
            status: http_status_codes_1.StatusCodes.BAD_REQUEST,
            message,
            errors: validationResponse,
        };
    }
    // Fetch user data from Redis
    const userData = await redis.get(`user:${email}`);
    if (!userData) {
        throw { status: http_status_codes_1.StatusCodes.NOT_FOUND, message: "User not found" };
    }
    const parsedUser = JSON.parse(userData);
    // Generate a new 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    // Save the new OTP to Redis with a 5-minute expiry
    await redis.set(`otp:${email}`, otp.toString(), "EX", 300); // 300 seconds = 5 minutes
    // Send OTP via Dojah
    await (0, nodemailer_helper_1.otpMailer)(email, otp.toString(), parsedUser.fullname);
    // Save reference_id if available
    await redis.set(`user:${email}`, JSON.stringify(parsedUser));
    return;
};
exports.resendOtp = resendOtp;
const forgotPassword = async (email) => {
    const schema = {
        email: { type: "email", empty: false },
    };
    const validationResponse = await v.validate({ email }, schema);
    if (validationResponse !== true) {
        const message = validationResponse.map((err) => err.message).join(", ");
        throw {
            status: http_status_codes_1.StatusCodes.BAD_REQUEST,
            message,
            errors: validationResponse,
        };
    }
    const user = await database_1.default.users.findUnique({
        where: { email }
    });
    if (!user) {
        throw { status: http_status_codes_1.StatusCodes.BAD_REQUEST, message: "Email address is not registered" };
    }
    // Generate a token for password reset
    const token = (0, jwt_util_1.generateAccessToken)({
        id: user.id,
        email: user.email
    });
    const url = `http://localhost:3000/reset-password?token=${token}`;
    await (0, nodemailer_helper_1.forgotPasswordMailer)(email, url);
    return;
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (userId, newPassword, confirmNewPassword) => {
    const schema = {
        newPassword: { type: "string", empty: false },
        confirmNewPassword: { type: "string", empty: false },
    };
    const validationResponse = await v.validate({ newPassword, confirmNewPassword }, schema);
    if (validationResponse !== true) {
        const message = validationResponse.map((err) => err.message).join(", ");
        throw {
            status: http_status_codes_1.StatusCodes.BAD_REQUEST,
            message,
            errors: validationResponse,
        };
    }
    const user = await database_1.default.users.findUnique({
        where: { id: userId }
    });
    if (!user) {
        throw { status: http_status_codes_1.StatusCodes.NOT_FOUND, message: "User not found" };
    }
    if (newPassword !== confirmNewPassword) {
        throw { status: http_status_codes_1.StatusCodes.BAD_REQUEST, message: "Passwords do not match" };
    }
    const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
    await database_1.default.users.update({
        where: { id: userId },
        data: { password: hashedPassword }
    });
    return;
};
exports.resetPassword = resetPassword;
