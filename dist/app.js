"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_2 = require("express");
const cors_1 = __importDefault(require("cors"));
const errorHandler_1 = require("./middlewares/errorHandler");
const morgan_1 = __importDefault(require("morgan"));
const index_1 = __importDefault(require("./modules/index"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.get('/', (req, res) => {
    res.send('Server is running!');
});
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || '*', // Replace with your frontend URL in production
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400 // 24 hours
}));
app.use((0, express_2.json)());
app.use((0, express_2.urlencoded)({ extended: true }));
app.use((0, morgan_1.default)('dev')); // Log requests to the console
app.use((0, cookie_parser_1.default)());
// Mount routes
app.use('/api/v1', index_1.default);
// Error handling middleware
app.use(errorHandler_1.errorHandler);
exports.default = app;
