import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { UserController } from "../controllers/UserController";

const authRoutes = Router();

const authController = new AuthController();
const userController = new UserController();

authRoutes.post("/register", (req, res, next) => userController.register(req, res, next));

authRoutes.post("/login", (req, res, next) => authController.login(req, res, next));

export { authRoutes };