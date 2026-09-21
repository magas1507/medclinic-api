import { NextFunction, Request, Response } from "express";

import { UserRole } from "../entities/User";

export function roleMiddleware(...allowedRoles: UserRole[]) {
  return function checkRole(req: Request, res: Response, next: NextFunction): void {

    if (!req.user) {
      res.status(401).json({ message: "Usuario nao autenticado." });
      return;
    }

    const userHasPermission = allowedRoles.includes(req.user.role);

    if (!userHasPermission) {
      res.status(403).json({ message: "Voce nao tem permissao para acessar este recurso." });
      return;
    }

    next();
  };
}