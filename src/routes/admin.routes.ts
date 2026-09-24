import { Request, Response, Router } from "express";
import { UserRole } from "../entities/User";
import { authMiddleware } from "../middlewares/authMiddleware";
import { roleMiddleware } from "../middlewares/roleMiddleware";

const adminRoutes = Router();

adminRoutes.get(
  "/ping",
  authMiddleware,
  roleMiddleware(UserRole.ADMIN),
  (req: Request, res: Response): void => {
    res.status(200).json({
      message: "pong - acesso de administrador confirmado.",
      requestedBy: req.user?.sub,
    });
  }
);

export { adminRoutes };