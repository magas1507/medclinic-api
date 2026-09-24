import { NextFunction, Request, Response } from "express";
import { LoginDTO } from "../dtos/LoginDTO";
import { AuthService } from "../services/AuthService";

export class AuthController {
  private authService: AuthService

  constructor() {
    this.authService = new AuthService()
  }


  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {

      const credentials: LoginDTO = req.body

      const result = await this.authService.login(credentials)

      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }
}