import { MenuItem } from "primeng/api";

export interface TableMenuItem<T> extends MenuItem {
    action?: (record?: T) => void;
}
