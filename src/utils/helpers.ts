import { ApiResponse } from '@/types';

export const successResponse = <T>(data: T, message?: string): ApiResponse<T> => ({
  statusCode: 200,
  body: {
    success: true,
    data,
    message,
  },
});

export const errorResponse = (statusCode: number, error: string): ApiResponse => ({
  statusCode,
  body: {
    success: false,
    error,
  },
});

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateRequired = (value: unknown, fieldName: string): void => {
  if (!value) {
    throw new Error(`${fieldName} is required`);
  }
};

export const parseJSON = (str: string): unknown => {
  try {
    return JSON.parse(str);
  } catch {
    throw new Error('Invalid JSON format');
  }
};
