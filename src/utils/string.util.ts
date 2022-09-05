import { ConfigService } from '@nestjs/config';
import { delayWhen } from 'rxjs';
import { validChar } from '../commons/string.common';

export async function encrypt(password: string): Promise<string> {
  const { createHash } = await import('crypto');
  return createHash(new ConfigService().get<string>('HASHAGR'))
    .update(password)
    .digest('hex');
}

export function generateCode(): string {
  return Math.floor(Math.random() * 900000 + 100000) + '';
}

export function splitString(
  input: string,
  separate: string,
  getPosition: number,
): string {
  return input.split(separate).at(getPosition);
}

export function getPublicId(url: string): string | null {
  if (!url) return url;
  return url.split('/').at(-1)?.split('.')[0];
}

export function randomString(limit: number): string {
  let rdString = '';
  for (let i = 0; i < limit; i++) {
    const pos = Math.floor(Math.random() * validChar.length);
    rdString += validChar[pos];
  }
  return rdString;
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

export function convertDate(date: Date): string {
  return date.toISOString().split('T').join(' ').split('Z')[0];
}
