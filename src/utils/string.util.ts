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

export function combineSort(sort: string): { key: string; value: string }[] {
  if (!sort) return [];
  const conditions = sort.split(';');
  const output: { key: string; value: string }[] = [];
  conditions.forEach((item) => {
    const itemSplited = item.split(':');
    if (itemSplited.length > 0) {
      if (output) {
        if (itemSplited.length >= 2) {
          output.push({ key: itemSplited[0], value: 'ASC' });
        } else {
          output.push({ key: itemSplited[0], value: 'DESC' });
        }
      }
    }
  });
  return output;
}

export function combineFilter(
  filter: string,
  force?: { key: string; value: string },
): string {
  if (!filter) return '';
  const conditions = filter.split(';');
  let output = '';
  conditions.forEach((item) => {
    const itemSplited = item.split(':');
    if (itemSplited.length > 0) {
      if (!force || force.key !== itemSplited[0]) {
        if (output) {
          if (itemSplited.length >= 2) {
            output += ` AND "${itemSplited[0]}" = '${itemSplited[1]}'`;
          } else {
          }
        } else {
          if (itemSplited.length >= 2) {
            output += `"${itemSplited[0]}" = '${itemSplited[1]}'`;
          }
        }
      }
    }
  });
  return output;
}

export function combineSearch(search: string): string {
  if (!search) return '';
  const conditions = search.split(';')[0];
  const splited = conditions.split(':');
  if (!splited[1]) return '';
  let output = '';
  if (splited.length >= 2) {
    output = `"${splited[0]}" LIKE '%${splited[1]}%'`;
  }
  return output;
}

export function combineRange(
  range: string,
  force?: { key: string; value: string },
): string {
  if (!range) return '';
  const conditions = range.split(';');
  let output = '';
  conditions.forEach((item) => {
    const itemSplited = item.split(':');
    if (itemSplited.length > 0) {
      if (!force || force.key !== itemSplited[0]) {
        if (output) {
          if (itemSplited.length >= 2) {
            const ranges = itemSplited[1].split('-');
            output += ` AND "${itemSplited[0]}" BETWEEN '${ranges[0]}' AND '${ranges[1]}'`;
          } else {
          }
        } else {
          if (itemSplited.length >= 2) {
            const ranges = itemSplited[1].split('-');
            output += `"${itemSplited[0]}" BETWEEN '${ranges[0]}' AND '${ranges[1]}'`;
          }
        }
      }
    }
  });
  return output;
}
