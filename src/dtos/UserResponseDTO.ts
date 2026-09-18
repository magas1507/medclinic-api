import { User, UserRole } from "../entities/User";

export interface UserResponseDTO {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}


export function toUserResponseDTO(user: User): UserResponseDTO {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}