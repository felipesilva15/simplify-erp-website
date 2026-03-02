import { ButtonProps } from "primeng/button";

export interface ConfirmDialogConfig {
    header?: string;
    message: string;
    icon?: string;
    rejectButtonProps?: { label?: string, severity?: string, outlined?: boolean },
    acceptButtonProps?: { label?: string, severity?: string, outlined?: boolean },
}
