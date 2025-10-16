"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.UnauthorizedError = exports.BadRequestError = exports.NotFoundError = void 0;
class HttpError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}
class NotFoundError extends HttpError {
    constructor(message = 'Not Found') {
        super(message, 404);
    }
}
exports.NotFoundError = NotFoundError;
class BadRequestError extends HttpError {
    constructor(message = 'Bad Request') {
        super(message, 400);
    }
}
exports.BadRequestError = BadRequestError;
class UnauthorizedError extends HttpError {
    constructor(message = 'Unauthorized') {
        super(message, 401);
    }
}
exports.UnauthorizedError = UnauthorizedError;
const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({ error: message });
};
exports.errorHandler = errorHandler;
