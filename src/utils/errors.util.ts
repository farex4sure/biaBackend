class HttpError extends Error {
  statusCode: number;
  data?: any;

  constructor(message: string, statusCode: number, data?: any) {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class HttpBadRequestError extends HttpError {
  constructor(message = 'Bad Request', data?: any) {
    super(message, 400, data);
  }
}

export class HttpUnauthorizedError extends HttpError {
  constructor(message = 'Unauthorized', data?: any) {
    super(message, 401, data);
  }
}

export class HttpNotFoundError extends HttpError {
  constructor(message = 'Not Found', data?: any) {
    super(message, 404, data);
  }
}

export class HttpInternalServerError extends HttpError {
  constructor(message = 'Internal Server Error', data?: any) {
    super(message, 500, data);
  }
}
