import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as util from 'util';

@Injectable()
export class CryptoService {
  private pbkdf2Async = util.promisify(crypto.pbkdf2);
  private randomBytesAsync = util.promisify(crypto.randomBytes);
  private readonly SALT_OF_ROUNDS = 10;

  /**
   * 해시 생성
   * @param plainText
   */
  async generateHash(plainText: string): Promise<string> {
    return await bcrypt.hash(plainText, this.SALT_OF_ROUNDS);
  }

  async generateHashByCrypto(plainText: string): Promise<string> {
    return crypto.createHash('sha256').update(plainText).digest('hex');
  }
  async generateHashByCryptoAsync(plainText: string) {
    const result: { salt: string; hash: string } = {
      salt: '',
      hash: '',
    };
    await this.randomBytesAsync(64)
      .then((buf) => {
        result['salt'] = buf.toString('hex');
        return this.pbkdf2Async(
          plainText,
          buf.toString('hex'),
          100000,
          64,
          'sha512',
        );
      })
      .then((hash) => {
        result['hash'] = hash.toString('hex');
      });
    return result;
    //return crypto.createHash('sha256').update(plainText).digest('hex');
  }
  /**
   * 해시 검증
   * @param plainText
   * @param hash
   */
  async validateHash(plainText: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(plainText, hash);
  }

  async validateHashByCryptoAsync(
    plainText: string,
    salt: string,
    hash: string,
  ) {
    const key = await this.pbkdf2Async(plainText, salt, 100000, 64, 'sha512');
    return key.toString('hex') === hash;
  }
}
