import { ApiLinkType } from "../types/api-link-type";
import { ApiMetaType } from "../types/api-meta-type";

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    warnings?: string[],
    links?: ApiLinkType;
    errors?: Record<string, string>;
    meta?: ApiMetaType;
}
