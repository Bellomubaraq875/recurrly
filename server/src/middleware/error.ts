import { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { HttpError } from '../utils/http';

export const notFound: RequestHandler = (_req, res) => {
  res.status(404).json({ message: 'Not found' });
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) return res.status(400).json({ message: err.issues[0]?.message ?? 'Invalid input' });
  if (err instanceof HttpError) return res.status(err.status).json({ message: err.message, code: err.code });
  if (err && err.code === 11000) return res.status(409).json({ message: 'Email already registered' });
  if (err && err.name === 'CastError') return res.status(400).json({ message: 'Invalid identifier' });
  console.error(err);
  res.status(500).json({ message: 'Something went wrong' });
};
