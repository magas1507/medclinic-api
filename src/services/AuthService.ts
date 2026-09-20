import { LoginDTO } from "../dtos/LoginDTO";
import { toUserResponseDTO, UserResponseDTO } from "../dtos/UserResponseDTO";
import { UserRepository } from "../repositories/UserRepository";
import { AppError } from "../utils/AppError";
import { comparePassword } from "../utils/hash";
import { generateToken } from "../utils/jwt";

export interface LoginResult {
  token: string;
  user: UserResponseDTO
}

export class AuthService {
  private userRepository: UserRepository

  constructor() {
    this.userRepository = new UserRepository()
  }

  async login(data: LoginDTO): Promise<LoginResult> {
    if (!data.email || !data.password) {
      throw new AppError("Informe e-mail e senha.", 400);
    }

    const normalizedEmail = data.email.trim().toLowerCase();
    const user = await this.userRepository.findByEmail(normalizedEmail)

    if (!user) {
      throw new AppError("Credenciais invalidas.", 401)
    }

    const passwordMatches = await comparePassword(data.password, user.password)
    if (!passwordMatches) {
      throw new AppError("Credenciais invalidas.", 401)
    }

    const token = generateToken({ sub: user.id, role: user.role })
    return {
      token,
      user: toUserResponseDTO(user),
    };
  }
}