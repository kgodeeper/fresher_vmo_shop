import { MAX_ELEMENTS_OF_PAGE } from '../commons/const.common';

export function getTotalPages(totalElements) {
  return Math.ceil(totalElements / MAX_ELEMENTS_OF_PAGE);
}
