import { Router } from "express";

import { adminRoutes } from "./admin.routes";
import { authRoutes } from "./auth.routes";
import { userRoutes } from "./user.routes";

const routes = Router();

routes.use("/auth", authRoutes);

routes.use("/users", userRoutes);

routes.use("/admin", adminRoutes);

export { routes };