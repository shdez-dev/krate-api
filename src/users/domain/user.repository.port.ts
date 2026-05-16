import { User } from './user.entity';

export abstract class UserRepositoryPort {
  abstract findById(id: string): Promise<User | null>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract save(user: User): Promise<User>;
  abstract updateRefreshToken(id: string, token: string | null): Promise<void>;
  abstract updateProfile(
    id: string,
    data: Pick<User, 'firstName' | 'lastName'>,
  ): Promise<User>;
}
