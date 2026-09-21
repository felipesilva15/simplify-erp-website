import { Observable } from 'rxjs';
import { ExportRequestParams } from '../models/export-request-params';

export interface ExportableService {
    export(params: ExportRequestParams): Observable<Blob>;
}