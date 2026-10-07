// صفحة من Laravel paginator بعد التحويل لـ camelCase
export interface Paginated<T> {
  items: T[];
  page: number;
  lastPage: number;
  perPage: number;
  total: number;
}
