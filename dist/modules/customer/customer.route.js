"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const customer_controller_1 = require("./customer.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const customerRoutes = express_1.default.Router();
customerRoutes.get('/customer-summary', auth_middleware_1.authenticate, customer_controller_1.customerSummaryController);
customerRoutes.get('', auth_middleware_1.authenticate, customer_controller_1.listCustomersController);
exports.default = customerRoutes;
