export interface IHttpException {
  statusCode: number;
  message: string;
  error: string;
}

export interface IPaginate<T> {
  page: number;
  totalPages: number;
  totalElements: number;
  elements: T[];
}

export interface IPagination<T> {
  items: T[];
  metadata: {
    totalItems: number;
    itemCount: number;
    itemPerPage: number;
    totalPages: number;
    currentPage: number;
  };
  links: {
    firstPage: string;
    nextPage: string;
    previousPage: string;
    lastPage: string;
  };
}
