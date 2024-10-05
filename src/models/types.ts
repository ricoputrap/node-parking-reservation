export interface IOperationResult<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string>;
}