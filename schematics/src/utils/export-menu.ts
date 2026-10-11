/** Import lines necessários para as opções de exportação na listagem. */
export function buildExportImportLines(toAppDeep: string): string {
  return [
    `import { ExportExtension } from '${toAppDeep}core/enums/export-extension';`,
    `import { ExportFormat } from '${toAppDeep}core/enums/export-format';`,
    `import { ExportMenuItem } from '${toAppDeep}core/models/export-menu-item';`,
  ].join('\n');
}

/** Bloco `const exportMenu` usado na listagem. */
export function buildExportMenuBlock(): string {
  return [
    'const exportMenu: ExportMenuItem[] = [',
    '  {',
    "    label: 'Completo (Excel)',",
    "    icon: 'pi pi-file-excel',",
    '    extension: ExportExtension.Xlsx,',
    '    format: ExportFormat.Completo,',
    '  },',
    '  {',
    "    label: 'Completo (CSV)',",
    "    icon: 'pi pi-file',",
    '    extension: ExportExtension.Csv,',
    '    format: ExportFormat.Completo,',
    '  }',
    '];',
  ].join('\n');
}

/** Terceiro argumento injetado na fábrica da `CrudListFacade`. */
export function buildFacadeConfigArg(): string {
  return `, {\n        exportMenu: exportMenu\n      }`;
}
