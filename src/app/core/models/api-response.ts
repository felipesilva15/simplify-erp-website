export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    warnings?: string[],
    links?: Map<string, string>;
    errors?: Map<string, string>;
    meta?: Map<string, any>;
}
