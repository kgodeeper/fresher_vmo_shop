import { NUMBER_OF_PAGE_ELEMENT } from './const.util';

export function getPageNumber(numberOfElement): number {
  return Math.ceil(numberOfElement / NUMBER_OF_PAGE_ELEMENT);
}
