export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: ApiError;
    metadata?: ResponseMetadata;
}

export interface ApiError {
    code: string;
    message: string;
    details?: any;
    timestamp: Date;
}

export interface ResponseMetadata {
    timestamp: Date;
    requestId?: string;
    pagination?: PaginationInfo;
    totalCount?: number;
}

export interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrevious: boolean;
}

export interface FilterOptions {
    field: string;
    operator: FilterOperator;
    value: any;
    logical?: 'AND' | 'OR';
}

export type FilterOperator = 
    | '==' | '!=' | '>' | '>=' | '<' | '<=' 
    | 'in' | 'not-in' | 'contains' | 'starts-with' | 'ends-with';

export interface SortOptions {
    field: string;
    direction: 'asc' | 'desc';
}

export interface QueryOptions {
    filters?: FilterOptions[];
    sort?: SortOptions[];
    limit?: number;
    page?: number;
    include?: string[];
}