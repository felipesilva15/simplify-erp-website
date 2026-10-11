import { NormalizedOptions } from './types';

export interface ServiceCode {
  /** Imports extras (contratos/modelos de lookup e exportação). */
  imports: string;
  /** Sufixo de `implements` (ex.: `, LookupService, ExportableService`). */
  implements: string;
  /** Métodos extras (search/export) com quebra de linha de separação. */
  methods: string;
}

const SEARCH_METHOD = `  search(params: LookupFilter): Observable<ApiResponse<LookupItem[]>> | Promise<ApiResponse<LookupItem[]>> {
    const httpParams: HttpParams = this.queryBuilder.buildHttpParams(params);
    return this.http.get<ApiResponse<LookupItem[]>>(\`\${this.baseUrl}/lookup\`, { withCredentials: true, params: httpParams });
  }`;

const EXPORT_METHOD = `  export(params: ExportRequestParams): Observable<Blob> {
    const httpParams: HttpParams = this.queryBuilder.buildHttpParams(params);
    return this.http.get(\`\${this.baseUrl}/export\`, { withCredentials: true, params: httpParams, responseType: 'blob' });
  }`;

/**
 * Monta os trechos condicionais do service: `LookupService`/`search` só existem
 * quando o lookup é gerado (`!--skip-lookup`) e `ExportableService`/`export` só
 * existem com `--with-export`.
 */
export function buildServiceCode(options: NormalizedOptions): ServiceCode {
  const toApp = '../'.repeat(options.moduleSegments + 3);
  const imports: string[] = [];
  const interfaces: string[] = [];
  const methods: string[] = [];

  if (!options.skipLookup) {
    imports.push(`import { LookupService } from '${toApp}core/contracts/lookup-service';`);
    imports.push(`import { LookupFilter } from '${toApp}core/models/lookup-filter';`);
    imports.push(`import { LookupItem } from '${toApp}core/models/lookup-item';`);
    interfaces.push('LookupService');
    methods.push(SEARCH_METHOD);
  }

  if (options.withExport) {
    imports.push(`import { ExportableService } from '${toApp}core/contracts/exportable-service';`);
    imports.push(`import { ExportRequestParams } from '${toApp}core/models/export-request-params';`);
    interfaces.push('ExportableService');
    methods.push(EXPORT_METHOD);
  }

  return {
    imports: imports.join('\n'),
    implements: interfaces.length ? `, ${interfaces.join(', ')}` : '',
    methods: methods.length ? `\n${methods.join('\n\n')}\n` : '',
  };
}
