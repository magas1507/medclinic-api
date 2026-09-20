import { NextFunction, Request, Response } from "express";

import { AppError } from "../utils/AppError";

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message })
    return;
  }

  console.error("[UNEXPECTED ERROR]", err)

  res.status(500).json({ message: "Erro interno no servidor." })
}

export function notFoundMiddleware(req: Request, res: Response): void {
  res.status(404).json({ message: `Rota nao encontrada: ${req.method} ${req.originalUrl}` })
}