"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("./user.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const userRoutes = express_1.default.Router();
userRoutes.get('/profile', auth_middleware_1.authenticate, user_controller_1.getProfileController);
userRoutes.post('/complete', auth_middleware_1.authenticate, user_controller_1.completeRegistrationController);
userRoutes.get('/dashboard', auth_middleware_1.authenticate, user_controller_1.dashboardSummaryController);
exports.default = userRoutes;
