export interface IResponseApi<T> {
  error?: boolean;
  data?: T | null;
  message?: string;
  code?: number;
}
