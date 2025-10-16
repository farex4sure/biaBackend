"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCustomersController = exports.customerSummaryController = void 0;
const http_status_codes_1 = require("http-status-codes");
const customer_service_1 = require("./customer.service");
const customerSummaryController = async (req, res) => {
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
        const result = await (0, customer_service_1.customerSummary)(userId);
        res.status(http_status_codes_1.StatusCodes.OK).json({
            responseSuccessful: true,
            responseMessage: "User customer summary successfully fetched",
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
exports.customerSummaryController = customerSummaryController;
const listCustomersController = async (req, res) => {
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
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const result = await (0, customer_service_1.listCustomers)(userId, page, limit);
        res.status(200).json({
            responseSuccessful: true,
            responseMessage: "Customers successfully fetched",
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
exports.listCustomersController = listCustomersController;
