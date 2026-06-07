/** Envoltorio uniforme que devuelve el backend (TransformInterceptor). */
export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  data: T;
  timestamp: string;
}

/** Forma del error que devuelve el backend (AllExceptionsFilter). */
export interface ApiError {
  success: false;
  statusCode: number;
  error: string;
  message: string | string[];
  path: string;
  timestamp: string;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/** Item de reordenamiento por lotes (categorías, productos…). */
export interface ReorderItem {
  id: string;
  sortOrder: number;
}
