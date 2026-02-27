import { MenuItem } from "primeng/api";

export interface TableMenuItem<T> extends MenuItem {
    permission?: string;
    action?: (record?: T) => void;
    enabled?: (record?: T) => boolean 
}
