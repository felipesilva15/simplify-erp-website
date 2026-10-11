import { strings } from '@angular-devkit/schematics';
import { isDateField, isEnumField, isLookupField, isNumberField, isStringField, resolveLookupReference, tsString } from './fields';
import { FieldDefinition, FormType, LookupRenderContext } from './types';

export interface FormCode {
  formTypeLines: string;
  formGroupLines: string;
  formFieldBlocks: string;
  formSkeletonBlocks: string;
  /** Linha(s) de import de `@angular/forms` (com módulos e tipos). */
  formFormsImport: string;
  /** Imports variáveis de módulos PrimeNG (pode ser vazio). */
  formPrimeImports: string;
  /** Entradas variáveis para o array `imports` do componente. */
  formImportModules: string;
  /** Imports de model/enum/lookup usados pelo componente (pode ser vazio). */
  formExtraImports: string;
  /** Propriedades de opções de enum declaradas na classe (pode ser vazio). */
  formEnumProperties: string;
}

function validators(field: FieldDefinition): string[] {
  const result: string[] = [];

  if (!field.optional) {
    result.push('Validators.required');
  }

  if (field.type === 'email') {
    result.push('Validators.maxLength(255)', 'Validators.email');
  } else if (field.type === 'textarea') {
    result.push('Validators.maxLength(512)');
  } else if (isStringField(field)) {
    result.push('Validators.maxLength(255)');
  }

  return result;
}

function formControlType(field: FieldDefinition): string {
  if (isLookupField(field)) {
    return 'LookupItem | null';
  }

  if (isEnumField(field)) {
    const enumClass = field.enumClass ?? 'string';

    return field.optional ? `${enumClass} | null` : enumClass;
  }

  if (isDateField(field)) {
    return 'Date | null';
  }

  if (field.type === 'boolean') {
    return 'boolean';
  }

  if (isNumberField(field)) {
    return 'number';
  }

  return 'string';
}

function formGroupLine(field: FieldDefinition): string {
  if (isLookupField(field)) {
    return `${field.name}: new FormControl<LookupItem | null>(null, [${validators(field).join(', ')}])`;
  }

  if (isEnumField(field)) {
    if (field.optional) {
      return `${field.name}: new FormControl<${field.enumClass} | null>(null, [])`;
    }

    const firstValue = field.enumValues?.[0]?.name ?? 'null';

    return `${field.name}: [${field.enumClass}.${firstValue}, [${validators(field).join(', ')}]]`;
  }

  const validatorsExpr = `[${validators(field).join(', ')}]`;

  if (isDateField(field)) {
    return `${field.name}: new FormControl<Date | null>(null, ${validatorsExpr})`;
  }

  if (field.type === 'boolean') {
    return `${field.name}: [false, ${validatorsExpr}]`;
  }

  if (isNumberField(field)) {
    return `${field.name}: [0, ${validatorsExpr}]`;
  }

  return `${field.name}: ['', ${validatorsExpr}]`;
}

function inputHtml(field: FieldDefinition): string {
  const invalid = `[invalid]="isInvalid('${field.name}')"`;
  const required = field.optional ? '' : ' required';

  switch (field.type) {
    case 'textarea':
      return `<textarea id="${field.name}" formControlName="${field.name}" pTextarea rows="3"${required} ${invalid}></textarea>`;
    case 'number':
    case 'integer':
    case 'decimal':
    case 'currency':
    case 'percent':
      return `<p-inputnumber inputId="${field.name}" formControlName="${field.name}" [showButtons]="true"${required} ${invalid} />`;
    case 'boolean':
      return `<p-toggleswitch name="${field.name}" formControlName="${field.name}" ${invalid} />`;
    case 'date':
      return `<p-datepicker id="${field.name}" inputId="${field.name}" formControlName="${field.name}" appendTo="body" dateFormat="dd/mm/yy" [showIcon]="true" [iconDisplay]="'input'" [showClear]="true"${required} ${invalid}></p-datepicker>`;
    case 'datetime':
      return `<p-datepicker id="${field.name}" inputId="${field.name}" formControlName="${field.name}" appendTo="body" dateFormat="dd/mm/yy" [showTime]="true" hourFormat="24" [showIcon]="true" [iconDisplay]="'input'" [showClear]="true"${required} ${invalid}></p-datepicker>`;
    default:
      return `<input id="${field.name}" formControlName="${field.name}" pInputText${required} ${invalid} />`;
  }
}

function lookupHtml(field: FieldDefinition, context: LookupRenderContext): string {
  const reference = resolveLookupReference(field, context);

  return `<${reference.selector} formControlName="${field.name}"></${reference.selector}>`;
}

function enumHtml(field: FieldDefinition): string {
  const options = `${strings.camelize(field.enumClass ?? field.name)}Options`;
  const clear = field.optional ? ' [showClear]="true"' : '';
  const placeholder = tsString(`Selecione ${field.label.toLowerCase()}`);

  return `<p-select id="${field.name}" inputId="${field.name}" formControlName="${field.name}" appendTo="body" [options]="${options}" optionLabel="name" optionValue="code"${clear} placeholder="${placeholder}" [invalid]="isInvalid('${field.name}')"></p-select>`;
}

function fieldBlock(field: FieldDefinition, columnClass: string, indent: number, step: number, context: LookupRenderContext): string {
  const pad = ' '.repeat(indent);
  const pad2 = ' '.repeat(indent + step);
  const pad3 = ' '.repeat(indent + step * 2);
  const errors = `${pad2}<app-form-control-errors [control]="form.get('${field.name}')"></app-form-control-errors>`;

  if (field.type === 'boolean') {
    return `${pad}<div class="${columnClass}">
${pad2}<div class="flex align-items-center gap-1">
${pad3}<p-toggleswitch name="${field.name}" formControlName="${field.name}" [invalid]="isInvalid('${field.name}')" />
${pad3}<label htmlFor="${field.name}">${tsString(field.label)}</label>
${pad2}</div>
${errors}
${pad}</div>`;
  }

  const requiredMark = field.optional ? '' : '<span class="text-red-500 font-bold">*</span>';
  const control = isLookupField(field) ? lookupHtml(field, context) : isEnumField(field) ? enumHtml(field) : inputHtml(field);

  return `${pad}<div class="${columnClass}">
${pad2}<label htmlFor="${field.name}">${tsString(field.label)}${requiredMark}</label>
${pad2}${control}
${errors}
${pad}</div>`;
}

function skeletonBlock(columnClass: string, indent: number, step: number): string {
  const pad = ' '.repeat(indent);
  const pad2 = ' '.repeat(indent + step);

  return `${pad}<div class="${columnClass}">
${pad2}<p-skeleton height="16px" width="20%" class="mb-2"></p-skeleton>
${pad2}<p-skeleton width="100%" height="39px"></p-skeleton>
${pad}</div>`;
}

/** Gera os trechos dependentes da definição de campos para os formulários. */
export function generateFormCode(fields: FieldDefinition[], variant: FormType, context: LookupRenderContext): FormCode {
  const columnClass = variant === 'page' ? 'col-12 md:col-6' : 'col-12';
  const fieldIndent = variant === 'page' ? 20 : 10;
  const step = variant === 'page' ? 4 : 2;
  const lookupsEnabled = context.lookupsEnabled;

  const formTypeLines = fields.map((field) => `  ${field.name}: FormControl<${formControlType(field)}>;`).join('\n');
  const formGroupLines = fields.map((field) => `    ${formGroupLine(field)},`).join('\n');
  const formFieldBlocks = fields
    .map((field) => fieldBlock(field, columnClass, fieldIndent, step, context))
    .join('\n');
  const formSkeletonBlocks = fields.map(() => skeletonBlock(columnClass, fieldIndent, step)).join('\n');

  const needsValidators = fields.some((field) => validators(field).length > 0);
  // `FormControl` é sempre usado na interface `FormType`.
  const formsSymbols = ['FormBuilder', 'FormControl', 'FormGroup', 'FormsModule', 'ReactiveFormsModule'];

  if (needsValidators) {
    formsSymbols.push('Validators');
  }

  formsSymbols.sort();

  const primeImports: string[] = [];
  const primeModules: string[] = [];
  const extraImports: string[] = [];
  const enumProperties: string[] = [];
  const seenModules = new Set<string>();
  const seenExtra = new Set<string>();

  const addPrime = (module: string, path: string): void => {
    if (seenModules.has(module)) {
      return;
    }

    seenModules.add(module);
    primeImports.push(`import { ${module} } from '${path}';`);
    primeModules.push(`    ${module},`);
  };

  const addModule = (module: string): void => {
    if (seenModules.has(module)) {
      return;
    }

    seenModules.add(module);
    primeModules.push(`    ${module},`);
  };

  const addExtra = (line: string): void => {
    if (seenExtra.has(line)) {
      return;
    }

    seenExtra.add(line);
    extraImports.push(line);
  };

  if (fields.some((field) => isStringField(field) && field.type !== 'textarea')) {
    addPrime('InputTextModule', 'primeng/inputtext');
  }

  if (fields.some((field) => field.type === 'textarea')) {
    addPrime('TextareaModule', 'primeng/textarea');
  }

  if (fields.some(isNumberField)) {
    addPrime('InputNumberModule', 'primeng/inputnumber');
  }

  if (fields.some((field) => field.type === 'boolean')) {
    addPrime('ToggleSwitchModule', 'primeng/toggleswitch');
  }

  if (fields.some(isDateField)) {
    addPrime('DatePickerModule', 'primeng/datepicker');
  }

  if (fields.some(isEnumField)) {
    addPrime('SelectModule', 'primeng/select');
  }

  for (const field of fields) {
    if (isLookupField(field) && lookupsEnabled) {
      const reference = resolveLookupReference(field, context);

      addExtra(`import { ${reference.componentClass} } from '${reference.importPath}';`);
      addModule(reference.componentClass);
      continue;
    }

    if (isEnumField(field) && field.enumClass && field.enumFile) {
      addExtra(`import { ${field.enumClass}, ${field.enumClass}Options } from '../../enums/${field.enumFile}';`);
      const propertyName = `${strings.camelize(field.enumClass)}Options`;
      const propertyLine = `  ${propertyName}: { code: ${field.enumClass}, name: string }[] = ${field.enumClass}Options;`;

      if (!enumProperties.includes(propertyLine)) {
        enumProperties.push(propertyLine);
      }
    }
  }

  if (fields.some((field) => isLookupField(field) && lookupsEnabled)) {
    addExtra(`import { LookupItem } from '${context.toAppDeep}core/models/lookup-item';`);
  }

  return {
    formTypeLines,
    formGroupLines,
    formFieldBlocks,
    formSkeletonBlocks,
    formFormsImport: `import { ${formsSymbols.join(', ')} } from '@angular/forms';`,
    formPrimeImports: primeImports.join('\n'),
    formImportModules: primeModules.join('\n'),
    formExtraImports: extraImports.length ? `\n${extraImports.join('\n')}` : '',
    formEnumProperties: enumProperties.length ? `${enumProperties.join('\n')}\n` : '',
  };
}
