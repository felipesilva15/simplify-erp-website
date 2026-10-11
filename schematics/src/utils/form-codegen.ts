import { isDateField, isNumberField, isStringField, tsString } from './fields';
import { FieldDefinition, FormType } from './types';

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

function fieldBlock(field: FieldDefinition, columnClass: string, indent: number, step: number): string {
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

  return `${pad}<div class="${columnClass}">
${pad2}<label htmlFor="${field.name}">${tsString(field.label)}${requiredMark}</label>
${pad2}${inputHtml(field)}
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
export function generateFormCode(fields: FieldDefinition[], variant: FormType): FormCode {
  const columnClass = variant === 'page' ? 'col-12 md:col-6' : 'col-12';
  const fieldIndent = variant === 'page' ? 20 : 10;
  const step = variant === 'page' ? 4 : 2;

  const formTypeLines = fields.map((field) => `  ${field.name}: FormControl<${formControlType(field)}>;`).join('\n');
  const formGroupLines = fields.map((field) => `    ${formGroupLine(field)},`).join('\n');
  const formFieldBlocks = fields.map((field) => fieldBlock(field, columnClass, fieldIndent, step)).join('\n');
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

  const addPrime = (module: string, path: string): void => {
    primeImports.push(`import { ${module} } from '${path}';`);
    primeModules.push(`    ${module},`);
  };

  if (fields.some(isStringField)) {
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

  return {
    formTypeLines,
    formGroupLines,
    formFieldBlocks,
    formSkeletonBlocks,
    formFormsImport: `import { ${formsSymbols.join(', ')} } from '@angular/forms';`,
    formPrimeImports: primeImports.join('\n'),
    formImportModules: primeModules.join('\n'),
  };
}
