import { DialogSize } from "../enums/dialog-size";

export interface DynamicDialogConfig {
    title?: string;
    data?: any;
    size?: DialogSize;
    closeable?: boolean;
    styleClass?: string;
}
