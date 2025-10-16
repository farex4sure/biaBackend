import { Response } from 'express';

export interface CustomResponse<T> extends Response {
  json: (body: {
    success: boolean;
    status: string;
    message: string;
    data: T;
  }) => this;
}
