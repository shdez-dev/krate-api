import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { HashPort } from '../../application/ports/hash.port';

@Injectable()
export class BcryptService implements HashPort {
  private readonly ROUNDS = 12;

  hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.ROUNDS);
  }

  compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }
}
