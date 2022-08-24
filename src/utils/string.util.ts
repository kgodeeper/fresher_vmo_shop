import { ConfigService } from '@nestjs/config';
import { validChar } from 'src/commons/string.common';

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

export function formatName(input: string): string {
  let name = input.trim().split(' ');
  name = name.reduce((prev: string[], item: string) => {
    if (item !== '') prev.push(item);
    return prev;
  }, []);
  name = name.map((item) => {
    item.toLowerCase();
    return item[0].toUpperCase() + item.substring(1);
  });
  return name.join(' ');
}

export function randomString(limit: number): string {
  let rdString = '';
  for (let i = 0; i < limit; i++) {
    const pos = Math.floor(Math.random() * validChar.length);
    rdString += validChar[pos];
  }
  return rdString;
}
