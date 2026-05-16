import { UserRole } from '../../shared/domain/value-objects/user-role.enum';

export class User {
  constructor(
    public readonly id: string,
    public email: string,
    public passwordHash: string,
    public firstName: string,
    public lastName: string,
    public role: UserRole,
    public refreshToken: string | null,
    public readonly createdAt: Date,
  ) {}
}
