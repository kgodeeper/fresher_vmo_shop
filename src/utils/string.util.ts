import { ConfigService } from '@nestjs/config';

export function generateCode(): string {
  return Math.floor(Math.random() * 900000 + 100000) + '';
}

export async function encrypt(password: string): Promise<string> {
  const { createHash } = await import('crypto');
  return createHash(new ConfigService().get<string>('HASHAGR'))
    .update(password)
    .digest('hex');
}

export function splitString(
  input: string,
  separate: string,
  getPosition: number,
): string {
  return input.split(separate).at(getPosition);
}

export function randomNumber(): string {
  return `${Math.floor(Math.random() * 1000) + Number(new Date())}`;
}
