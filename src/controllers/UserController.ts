import { NextFunction, Request, Response } from "express";
import { CreateUserDTO } from "../dtos/CreateUserDTO";
import { AppError } from "../utils/AppError";
import { UserService } from "../services/UserService";

export class UserController {
  private userService: UserService

  constructor() {
    this.userService = new UserService()
  }

  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: CreateUserDTO = req.body

      const createdUser = await this.userService.register(data)

      res.status(201).json(createdUser)
    } catch (error) {
      next(error)
    }
  }

  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError("Usuario nao autenticado.", 401)
      }

      const currentUser = await this.userService.getById(req.user.sub)

      res.status(200).json(currentUser)
    } catch (error) {
      next(error)
    }
  }
}