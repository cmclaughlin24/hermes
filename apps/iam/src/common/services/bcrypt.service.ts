import { Injectable } from '@nestjs/common';
import { compare } from 'bcrypt';
import { HashingService } from './hashing.service';

@Injectable()
export class BcryptService extends HashingService {
  hash(data: string | Buffer): Promise<string> {
    throw new Error('Method not implemented.');
  }
  
  compare(data: string | Buffer, encrypted: string): Promise<boolean> {
    return compare(data, encrypted);
  }
}
