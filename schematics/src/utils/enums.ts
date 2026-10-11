import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { isEnumField, tsString } from './fields';
import { EnumValue, FieldDefinition, NormalizedOptions } from './types';

/** Monta o conteúdo de um arquivo de enumeração no padrão do projeto. */
export function buildEnumFileContent(enumClass: string, values: EnumValue[]): string {
  const members = values.map((value) => `    ${value.name} = '${tsString(value.value)}',`).join('\n');
  const labels = values
    .map((value) => `    [${enumClass}.${value.name}]: '${tsString(value.label)}',`)
    .join('\n');

  return [
    `export enum ${enumClass} {`,
    members,
    '}',
    '',
    `export const ${enumClass}Labels: Record<${enumClass}, string> = {`,
    labels,
    '};',
    '',
    `export const ${enumClass}Options: { code: ${enumClass}, name: string }[] = (Object.keys(${enumClass}) as (keyof typeof ${enumClass})[])`,
    '.map(key => ({',
    `    code: ${enumClass}[key] as ${enumClass},`,
    `    name: ${enumClass}Labels[${enumClass}[key] as ${enumClass}],`,
    '}));',
    '',
  ].join('\n');
}

/** Caminho destino de um arquivo de enumeração. */
function enumPath(featureDir: string, field: FieldDefinition): string {
  return `${featureDir}/enums/${field.enumFile}.ts`;
}

/**
 * Gera os arquivos de enumeração dos campos `enum`. É idempotente: arquivos
 * existentes com o mesmo conteúdo não são reescritos; com conteúdo diferente,
 * são preservados (a menos que `force`) com um aviso.
 */
export function addEnumFiles(options: NormalizedOptions): Rule {
  return (tree: Tree, context: SchematicContext): Tree => {
    const enums = options.fields.filter(
      (field): field is FieldDefinition & { enumClass: string; enumValues: EnumValue[] } =>
        isEnumField(field) && !!field.enumClass && !!field.enumValues,
    );

    if (enums.length === 0) {
      return tree;
    }

    for (const field of enums) {
      const path = enumPath(options.featureDir, field);
      const content = buildEnumFileContent(field.enumClass, field.enumValues);
      const existing = tree.read(path)?.toString('utf-8');

      if (existing === undefined) {
        tree.create(path, content);
        continue;
      }

      if (existing === content) {
        continue;
      }

      if (options.force) {
        tree.overwrite(path, content);
        continue;
      }

      context.logger.warn(`Arquivo já existente e mantido sem alterações: ${path}. Use --force para sobrescrever.`);
    }

    return tree;
  };
}
