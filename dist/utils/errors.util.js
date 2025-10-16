"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpInternalServerError = exports.HttpNotFoundError = exports.HttpUnauthorizedError = exports.HttpBadRequestError = void 0;
class HttpError extends Error {
    constructor(message, statusCode, data) {
        super(message);
        this.statusCode = statusCode;
        this.data = data;
        Error.captureStackTrace(this, this.constructor);
    }
}
class HttpBadRequestError extends HttpError {
    constructor(message = 'Bad Request', data) {
        super(message, 400, data);
    }
}
exports.HttpBadRequestError = HttpBadRequestError;
class HttpUnauthorizedError extends HttpError {
    constructor(message = 'Unauthorized', data) {
        super(message, 401, data);
    }
}
exports.HttpUnauthorizedError = HttpUnauthorizedError;
class HttpNotFoundError extends HttpError {
    constructor(message = 'Not Found', data) {
        super(message, 404, data);
    }
}
exports.HttpNotFoundError = HttpNotFoundError;
class HttpInternalServerError extends HttpError {
    constructor(message = 'Internal Server Error', data) {
        super(message, 500, data);
    }
}
exports.HttpInternalServerError = HttpInternalServerError;
