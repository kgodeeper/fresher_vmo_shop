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
