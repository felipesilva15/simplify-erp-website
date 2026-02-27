export interface ListQuery {
  filters?: Record<string, any>;
  page?: number;
  size?: number;
  sort?: string;
}