"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardSummaryController = exports.completeRegistrationController = exports.getProfileController = void 0;
const user_dto_1 = require("./user.dto");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const user_service_1 = require("./user.service");
const http_status_codes_1 = require("http-status-codes");
const getProfileController = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({
            responseSuccessful: false,
            responseMessage: "Unauthorized",
            responseBody: null,
        });
        return;
    }
    try {
        const result = await (0, user_service_1.getProfile)(userId);
        res.status(http_status_codes_1.StatusCodes.OK).json({
            responseSuccessful: true,
            responseMessage: "User profile successfully fetched",
            responseBody: result,
        });
    }
    catch (err) {
        const status = err.status || http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR;
        const message = err.message || "Something went wrong";
        res.status(status).json({
            responseSuccessful: false,
            responseMessage: message,
            responseBody: null,
        });
    }
};
exports.getProfileController = getProfileController;
const completeRegistrationController = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({
                responseSuccessful: false,
                responseMessage: "Unauthorized",
                responseBody: null
            });
            return;
        }
        const dto = (0, class_transformer_1.plainToInstance)(user_dto_1.CreateBusinessDto, req.body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({
                responseSuccessful: false,
                responseMessage: "Validation failed",
                responseBody: errors,
            });
            return;
        }
        const result = await (0, user_service_1.completeRegistration)(userId, dto);
        res.status(200).json({
            responseSuccessful: true,
            responseMessage: "Business registration completed",
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
exports.completeRegistrationController = completeRegistrationController;
const dashboardSummaryController = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({
                responseSuccessful: false,
                responseMessage: "Unauthorized",
                responseBody: null
            });
            return;
        }
        const result = await (0, user_service_1.dashboardSummary)(userId);
        res.status(200).json({
            responseSuccessful: true,
            responseMessage: "Dashboard summary successfully fetched",
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
exports.dashboardSummaryController = dashboardSummaryController;
