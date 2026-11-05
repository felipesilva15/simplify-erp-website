import {
  AbstractControl,
  AsyncValidatorFn,
  FormArray,
  FormControl,
  FormControlOptions,
  FormControlState,
  FormGroup,
  ValidatorFn,
} from '@angular/forms';

export type DecimalValue = number | string | null;
export type DecimalFormControl = DecimalControl | FormControl<DecimalValue>;

export class DecimalControl extends FormControl<DecimalValue> {
  constructor(
    public readonly scale: number,
    formState: FormControlState<DecimalValue> | DecimalValue = null,
    validatorOrOpts?: ValidatorFn | ValidatorFn[] | FormControlOptions | null,
    asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null,
  ) {
    super(formState, validatorOrOpts, asyncValidator);
  }
}

/**
 * Converte um valor numérico ou textual para string com as casas decimais configuradas.
 * Valores vazios, nulos ou indefinidos retornam `null`.
 */
export function toDecimal(value: unknown, scale: number): string | null | unknown {
  if (value === null || value === undefined) {
    return null;
  }

  const safeScale = Number.isFinite(scale) ? Math.max(0, Math.trunc(scale)) : 0;

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      return null;
    }
    return value.toFixed(safeScale);
  }

  if (typeof value !== 'string') {
    return value;
  }

  const s = value.trim();
  if (s === '') {
    return null;
  }

  let normalized = s;
  if (s.includes(',') && s.includes('.')) {
    if (s.lastIndexOf(',') > s.lastIndexOf('.')) {
      normalized = s.replace(/\./g, '').replace(',', '.');
    } else {
      normalized = s.replace(/,/g, '');
    }
  } else if (s.includes(',')) {
    normalized = s.replace(',', '.');
  }

  const num = Number(normalized);
  if (Number.isFinite(num)) {
    return num.toFixed(safeScale);
  }

  return value;
}

/**
 * Percorre recursivamente a estrutura de controles do formulário e o payload correspondente,
 * serializando campos `DecimalControl` de number para string com a escala configurada.
 */
export function serializeDecimals<T = unknown>(control: AbstractControl | null | undefined, value: T): T {
  if (!control) {
    return value;
  }

  if (control instanceof DecimalControl) {
    return toDecimal(value, control.scale) as T;
  }

  if (control instanceof FormGroup) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return value;
    }

    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [
        k,
        control.controls[k] ? serializeDecimals(control.controls[k], v) : v,
      ]),
    ) as T;
  }

  if (control instanceof FormArray) {
    if (!Array.isArray(value)) {
      return value;
    }

    return value.map((v: unknown, i: number) =>
      control.at(i) ? serializeDecimals(control.at(i), v) : v,
    ) as T;
  }

  return value;
}
