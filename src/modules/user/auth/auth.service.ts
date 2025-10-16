import bcrypt from "bcrypt";
import prisma from "../../../config/database";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../../utils/jwt.util";
import { StatusCodes } from "http-status-codes";
import Validator from "fastest-validator";
import Redis from "ioredis";
import axios from "axios";
const v = new Validator();

const redis = new Redis({
  host: process.env.REDIS_HOST || 'redis-17422.c246.us-east-1-4.ec2.redns.redis-cloud.com',
  port: Number(process.env.REDIS_PORT) || 17422,
  password: process.env.REDIS_PASSWORD || 'LXeMI3WBiSTJ7IyyAu1TJSb8uwgm6Wbt',
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

export const getRefreshToken = async (refreshToken: string) => {

  const token = refreshToken;

  if (!token)
    throw { status: StatusCodes.UNAUTHORIZED, message: "you are not authorized" }

  try {
    const payload = verifyRefreshToken(token) as { id: number; phone: string };

    // Optionally: check if token exists in DB/Redis for extra security
    const isValid = await prisma.users.findFirst({
      where: { refreshToken: token }
    });

    if (!isValid) {
      throw {
        status: StatusCodes.FORBIDDEN,
        message: "Invalid refresh token"
      };
    }

    const newAccessToken = generateAccessToken({ id: payload.id, phone: payload.phone });
    const newRefreshToken = generateRefreshToken({ id: payload.id, phone: payload.phone });

    await prisma.users.update({
      where: { id: isValid.id },
      data: {
        refreshToken: newRefreshToken
      }
    })

    return {
      accessToken: newAccessToken
    };

  } catch (err) {
    throw {
      status: StatusCodes.FORBIDDEN,
      message: "Invalid or expired refresh token"
    };
  }
}

export const login = async (body: any) => {

  const { phone, password } = body;

  const schema = {
    phone: { type: "string", empty: false },
    password: { type: "string", min: 6, empty: false },
  };

  const validationResponse = await v.validate({ phone, password }, schema);

  if (validationResponse !== true) {
    const message = validationResponse.map((err: any) => err.message).join(", ");
    throw {
      status: StatusCodes.BAD_REQUEST,
      message,
      errors: validationResponse,
    };
  }

  const user = await prisma.users.findFirst({
    where: { phone }
  });

  if (!user) {
    throw { status: StatusCodes.NOT_FOUND, message: "Invalid login credentials" };
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw { status: StatusCodes.UNAUTHORIZED, message: "Invalid login credentials" };
  }

  if (!user.email) {
    throw { status: StatusCodes.INTERNAL_SERVER_ERROR, message: "User email is missing" };
  }

  const accessToken = generateAccessToken({
    id: user.id,
    phone: user.phone,
  });

  const refreshToken = generateRefreshToken({
    id: user.id,
    phone: user.phone,
  });

  await prisma.users.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  return {
    user,
    accessToken,
    refreshToken
  };
}

export const register = async (body: any) => {

  const { phone } = body;

  const schema = {
    phone: { type: "string", empty: false },
  };

  const validationResponse = await v.validate({ phone }, schema);

  if (validationResponse !== true) {
    const message = validationResponse.map((err: any) => err.message).join(", ");
    throw {
      status: StatusCodes.BAD_REQUEST,
      message,
      errors: validationResponse,
    };
  }

  const user = await prisma.users.findFirst({
    where: { phone },
  });

  if (user) {
    throw { status: StatusCodes.BAD_REQUEST, message: "User already exists" };
  }

  const otp = Math.floor(100000 + Math.random() * 900000);

  try {
    const data = {
      "to": phone,
      "from": process.env.TERMII_SENDER_ID,
      "sms": `Your OTP is ${otp}`,
      "type": "plain",
      "api_key": process.env.TERMII_API_KEY,
      "channel": "generic",
    };

    const response = await axios.post(
      `${process.env.TERMII_BASE_URL}/api/sms/send`,
      data,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    console.log(response.data);
    console.log(response.data.message);
  } catch (error) {
    console.error('Error sending SMS:', error);
    console.log((error as any).response.data.message);
    throw { status: StatusCodes.INTERNAL_SERVER_ERROR, message: (error as any).response.data.message };
  }
  const userPayload = {
    phone,
    otp,
  };

  await redis.set(`otp:${phone}`, otp.toString(), "EX", otpTTL);
  await redis.set(`user:${phone}`, JSON.stringify(userPayload));

  return;
}

export const verifyOtp = async (body: any) => {

  const { otp, phone } = body;

  const schema = {
    otp: { type: "string", empty: false },
    phone: { type: "string", empty: false },
  };

  const validationResponse = await v.validate({ otp, phone }, schema);
  if (validationResponse !== true) {
    const message = validationResponse.map((err: any) => err.message).join(", ");
    throw {
      status: StatusCodes.BAD_REQUEST,
      message,
      errors: validationResponse,
    };
  }

  const user = await prisma.users.findFirst({
    where: { phone },
  });

  if (!user) {
    throw { status: StatusCodes.NOT_FOUND, message: "User not found" };
  }

  const userOtp = await redis.get(`otp:${phone}`);
  if (!userOtp) {
    throw { status: StatusCodes.GONE, message: "OTP has expired. Please request a new one." };
  }

  if (otp !== userOtp) {
    throw { status: StatusCodes.BAD_REQUEST, message: "Invalid OTP" };
  }

  const newUser = await prisma.users.create({
    data: {
      fullname: '',
      email: '',
      phone,
      password: '',
    },
  });
  return newUser;
}

export const completeRegistration = async (userId: number, body: any) => {

  const { fullname, email, password } = body;

  const schema = {
    fullname: { type: "string", empty: false },
    email: { type: "email", empty: false },
    password: { type: "string", empty: false },
  };

  const validationResponse = await v.validate({ fullname, email, password }, schema);
  if (validationResponse !== true) {
    const message = validationResponse.map((err: any) => err.message).join(", ");
    throw {
      status: StatusCodes.BAD_REQUEST,
      message,
      errors: validationResponse,
    };
  }
  
  const user = await prisma.users.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw { status: StatusCodes.NOT_FOUND, message: "User not found" };
  }

  const isEmailExists = await prisma.users.findFirst({
    where: { email }
  });

  if (isEmailExists) {
    throw { status: StatusCodes.BAD_REQUEST, message: "Email already exists" };
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  const updatedUser = await prisma.users.update({
    where: { id: userId },
    data: { fullname, email, password: hashedPassword },
  });

  const accessToken = generateAccessToken({ id: updatedUser.id, phone: updatedUser.phone });
  const refreshToken = generateRefreshToken({ id: updatedUser.id, phone: updatedUser.phone });

  await prisma.users.update({
    where: { id: updatedUser.id },
    data: { refreshToken },
  });

  return { user: updatedUser, accessToken, refreshToken };
}

export const resendOtp = async (body: any) => {

  const { phone } = body;

  const schema = {
    phone: { type: "string", empty: false },
  };

  const validationResponse = await v.validate({ phone }, schema);
  if (validationResponse !== true) {
    const message = validationResponse.map((err: any) => err.message).join(", ");
    throw {
      status: StatusCodes.BAD_REQUEST,
      message,
      errors: validationResponse,
    };
  }

  const userData = await redis.get(`user:${phone}`);
  if (!userData) {
    throw { status: StatusCodes.NOT_FOUND, message: "User not found" };
  }

  const parsedUser = JSON.parse(userData);

  const otp = Math.floor(100000 + Math.random() * 900000);

  try {
    const data = {
      "to": phone,
      "from": process.env.TERMII_SENDER_ID,
      "sms": `Your OTP is ${otp}`,
      "type": "plain",
      "api_key": process.env.TERMII_API_KEY,
      "channel": "generic",
    };

    const response = await axios.post(
      `${process.env.TERMII_BASE_URL}/api/sms/send`,
      data,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    console.log(response.data);
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw { status: StatusCodes.INTERNAL_SERVER_ERROR, message: "Failed to send OTP SMS" };
  }

  await redis.set(`otp:${phone}`, otp.toString(), "EX", otpTTL);
  await redis.set(`user:${phone}`, JSON.stringify(parsedUser));

  return;
}

export const forgotPassword = async (body: any) => {

  const { phone } = body;

  const schema = {
    phone: { type: "string", empty: false },
  };

  const validationResponse = await v.validate({ phone }, schema);
  if (validationResponse !== true) {
    const message = validationResponse.map((err: any) => err.message).join(", ");
    throw {
      status: StatusCodes.BAD_REQUEST,
      message,
      errors: validationResponse,
    };
  }

  const user = await prisma.users.findFirst({
    where: { phone }
  });

  if (!user) {
    throw { status: StatusCodes.NOT_FOUND, message: "User not found" };
  }
  
  const otp = Math.floor(100000 + Math.random() * 900000);

  try {
    const data = {
      "to": phone,
      "from": process.env.TERMII_SENDER_ID,
      "sms": `Your password reset OTP is ${otp}`,
      "type": "plain",
      "api_key": process.env.TERMII_API_KEY,
      "channel": "generic"
    };
    
    const response = await axios.post(
      `${process.env.TERMII_BASE_URL}/api/sms/send`,
      data,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    console.log(response.data);
    await redis.set(`otp:${phone}`, otp.toString(), "EX", otpTTL);
    await redis.set(`user:${phone}`, JSON.stringify(user), "EX", otpTTL);
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw { status: StatusCodes.INTERNAL_SERVER_ERROR, message: "Failed to send password reset OTP SMS" };
  }

  return;
}

export const resetPassword = async (body: any) => {

  const { otp, phone, newPassword, confirmNewPassword } = body;

  const schema = {
    otp: { type: "string", empty: false },
    phone: { type: "string", empty: false },
    newPassword: { type: "string", empty: false },
    confirmNewPassword: { type: "string", empty: false },
  };

  const validationResponse = await v.validate({ otp, phone, newPassword, confirmNewPassword }, schema);
  if (validationResponse !== true) {
    const message = validationResponse.map((err: any) => err.message).join(", ");
    throw {
      status: StatusCodes.BAD_REQUEST,
      message,
      errors: validationResponse,
    };
  }

  if (newPassword !== confirmNewPassword) {
    throw { status: StatusCodes.BAD_REQUEST, message: "Passwords do not match" };
  }
  
  const user = await prisma.users.findFirst({
    where: { phone }
  });

  if (!user) {
    throw { status: StatusCodes.NOT_FOUND, message: "User not found" };
  }

  const userOtp = await redis.get(`otp:${phone}`);
  if (!userOtp) {
    throw { status: StatusCodes.GONE, message: "OTP has expired. Please request a new one." };
  }

  if (otp !== userOtp) {
    throw { status: StatusCodes.BAD_REQUEST, message: "Invalid OTP" };
  }

  await redis.del(`otp:${phone}`);
  await redis.del(`user:${phone}`);

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.users.update({
    where: { id: user.id },
    data: { password: hashedPassword }
  });

  return;
}