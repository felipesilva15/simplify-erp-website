export interface LookupItem {
  key: string | number;
  label: string;
  sublabel?: string;
  meta?: Record<string, unknown>;
}