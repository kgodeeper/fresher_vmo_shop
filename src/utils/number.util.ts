import { MAX_ELEMENTS_OF_PAGE } from '../commons/const.common';

export function getTotalPages(totalElements: number, limit?: number): number {
  return Math.ceil(totalElements / (limit ? limit : MAX_ELEMENTS_OF_PAGE));
}
