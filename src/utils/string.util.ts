import { ConfigService } from '@nestjs/config';
import { delayWhen } from 'rxjs';
import { validChar } from '../commons/string.common';
import { getAllForceOptions, getAllForces } from './interface.util';

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

export function getForces(forceTargets: getAllForceOptions): string[] {
  if (!forceTargets) return [];
  return forceTargets.forces.map((item) => {
    return item.column;
  });
}

export function bindForceQuery(forceTargets: getAllForceOptions): string {
  if (!forceTargets) return '';
  const forceTargetStr = forceTargets.forces.map((item) => {
    return `"${item.column}"='${item.condition}'`;
  });
  return forceTargetStr.join(' AND ');
}

export function bindSearchQuery(query: string): string {
  if (!query) return '';
  const searches = query.split(';')[0]?.split(':');
  if (!searches || !searches?.[1]?.trim()) return '';
  return `LOWER("${searches[0]}") LIKE LOWER('%${searches[1]}%')`;
}

export function bindRangeQuery(query: string): string {
  if (!query) return '';
  return `"${query
    .replace(/;/g, `' AND "`)
    .replace(/:/g, `" BETWEEN '`)
    .replace(/-/g, `' AND '`)}'`;
}

export function bindFilterQuery(
  query: string,
  forceTargets?: getAllForceOptions,
): string {
  if (!query) return '';
  const forces = getForces(forceTargets);
  const splited = query.split(';');
  const reduceCondition = splited.reduce((result, item) => {
    const splitBody = item.split(':');
    if (!forces.includes(splitBody[0]) && splitBody[1]?.trim()) {
      result.push(item);
    }
    return result;
  }, []);
  return '"' + reduceCondition.join(`' AND "`).replace(/:/g, `"='`) + "'";
}

export function bindSortQuery(query: string): string {
  if (!query) return '';
  const splited = query.split(';');
  const reduceCondition = splited.reduce((result, item) => {
    const splitBody = item.split(':');
    !splitBody[1] ? (splitBody[1] = 'ASC') : (splitBody[1] = 'DESC');
    result.push(`"${splitBody[0]}" ${splitBody[1]}`);
    return result;
  }, []);
  return reduceCondition.join(' AND ');
}
