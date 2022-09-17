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

export interface getAllConditionOptions {
  search?: string;
  sort?: string;
  filter?: string;
  range?: string;
}

export interface getAllForces {
  column: string;
  condition: string;
}

export interface getAllForceOptions {
  forces: getAllForces[];
}

export interface getAllJoins {
  column: string;
  optional: string;
}

export interface getAllJoinOptions {
  rootName: string;
  joinColumns: getAllJoins[];
}
