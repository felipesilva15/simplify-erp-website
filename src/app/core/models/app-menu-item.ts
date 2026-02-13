import { MenuItem } from "primeng/api";

export interface AppMenuItem extends MenuItem {
  permission?: string | string[];
}