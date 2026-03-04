import { Severity } from "../types/severity";

export interface ToastConfig {
    title?: string;
    message: string;
    severity?: Severity;
    life?: number;
}
