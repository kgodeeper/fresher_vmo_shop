export interface AppException {
  status: number;
  message: string | any;
  error: string | any;
  timestamp: string | any;
}

export interface Paginate<T> {
  page: number;
  totalPages: number;
  totalElements: number;
  elements: T[];
}
