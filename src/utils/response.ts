import { Response } from 'express';
import { ApiResponse } from '../types';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
  };
  // Use custom JSON stringify to prevent HTML entity encoding
  res.status(statusCode);
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(response));
  return res;
};

export const sendError = (
  res: Response,
  error: string,
  statusCode: number = 400
): Response => {
  const response: ApiResponse = {
    success: false,
    error,
  };
  // Use custom JSON stringify to prevent HTML entity encoding
  res.status(statusCode);
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(response));
  return res;
};