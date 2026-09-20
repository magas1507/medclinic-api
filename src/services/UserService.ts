import { CreateUserDTO } from "../dtos/CreateUserDTO";
import { toUserResponseDTO, UserResponseDTO } from "../dtos/UserResponseDTO";
import { UserRole } from "../entities/User";
import { UserRepository } from "../repositories/UserRepository";
import { AppError } from "../utils/AppError";
import { hashPassword } from "../utils/hash";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


export class UserService {
  private userRepository: UserRepository

  constructor() {
    this.userRepository = new UserRepository()
  }

  async register(data: CreateUserDTO): Promise<UserResponseDTO> {

    this.validateRegistrationInput(data)

    const normalizedEmail = data.email.trim().toLowerCase()

    const emailAlreadyInUse = await this.userRepository.existsByEmail(normalizedEmail);

    if (emailAlreadyInUse) {

      throw new AppError("Este e-mail ja esta cadastrado.", 409)
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await this.userRepository.create({
      name: data.name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: data.role ?? UserRole.ATTENDANT,
    })

    return toUserResponseDTO(user)
  }

  async getById(id: string): Promise<UserResponseDTO> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new AppError("Usuario nao encontrado.", 404);
    }

    return toUserResponseDTO(user);
  }

  private validateRegistrationInput(data: CreateUserDTO): void {
    if (!data.name || data.name.trim().length < 2) {
      throw new AppError("O campo 'name' e obrigatorio e deve ter ao menos 2 caracteres.", 400);
    }

    if (!data.email || !EMAIL_REGEX.test(data.email.trim())) {
      throw new AppError("Informe um e-mail em um formato valido.", 400);
    }

    if (!data.password || data.password.length < 6) {
      throw new AppError("O campo 'password' e obrigatorio e deve ter ao menos 6 caracteres.", 400);
    }

    if (data.role !== undefined && !Object.values(UserRole).includes(data.role)) {
      throw new AppError("O campo 'role' informado e invalido.", 400);
    }
  }
}