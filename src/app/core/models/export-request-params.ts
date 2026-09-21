import { ExportExtension } from '../enums/export-extension';
import { ExportFormat } from '../enums/export-format';
import { ListRequestParams } from './list-request-params';

export interface ExportRequestParams extends ListRequestParams {
    extension: ExportExtension;
    format: ExportFormat;
}