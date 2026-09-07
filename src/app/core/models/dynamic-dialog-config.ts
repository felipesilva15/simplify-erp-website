import { DialogSize } from "../enums/dialog-size";

export interface DynamicDialogConfig<D = any> {
    title?: string;
    data?: D;
    size?: DialogSize;
    closeable?: boolean;
    styleClass?: string;
}
