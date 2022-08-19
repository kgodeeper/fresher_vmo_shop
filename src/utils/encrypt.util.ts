import { ConfigService } from '@nestjs/config';

export async function encrypt(password: string): Promise<string> {
  const { createHash } = await import('crypto');
  return createHash(new ConfigService().get<string>('HASHAGR'))
    .update(password)
    .digest('hex');
}
