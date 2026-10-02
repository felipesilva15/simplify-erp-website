import { CurrencyPipe, DatePipe, PercentPipe } from '@angular/common';
import { inject, Injectable, LOCALE_ID, PipeTransform } from '@angular/core';
import { ColumnType } from '../../core/enums/column-type';

/**
 * Definição mínima de coluna necessária à formatação. Atendida tanto por
 * `TableColumn<T>` (listagens principais) quanto por `ChildFieldDefinition`
 * (itens filhos), garantindo que a mesma coluna seja exibida do mesmo jeito
 * nos dois contextos.
 */
export interface CellDefinition {
  /** Chave da propriedade na linha. Aceita caminho aninhado (`state.name`). */
  field: string;
  type?: ColumnType;
  pipe?: PipeTransform;
  pipeArgs?: unknown[];
  enumOptionLabels?: Record<string, string>;
}

/**
 * Formatação de valor de célula compartilhada entre as listagens principais
 * (`CrudListComponent`) e as tabelas de itens filhos
 * (`SummaryTableComponent`).
 *
 * Os pipes do `@angular/common` não são `providedIn: 'root'` — precisam ser
 * declarados em `providers` por quem os consome. Aqui eles são instanciados
 * diretamente com o `LOCALE_ID` da aplicação, para que o serviço funcione em
 * qualquer contexto de injeção (raiz, `providers` de componente ou `TestBed`)
 * sem exigir que cada consumidor reDeclare os pipes.
 */
@Injectable({
  providedIn: 'root',
})
export class CellValueFormatterService {
  private locale = inject(LOCALE_ID);

  private datePipe = new DatePipe(this.locale);
  private currencyPipe = new CurrencyPipe(this.locale);
  private percentPipe = new PercentPipe(this.locale);

  format(record: unknown, definition: CellDefinition): string {
    const value: unknown = this.resolve(record, definition.field) ?? '';

    if (definition.pipe) {
      return definition.pipe.transform(value, ...(definition.pipeArgs ?? []));
    }

    switch (definition.type) {
      case ColumnType.Date:
        return this.datePipe.transform(value as Date | string, 'dd/MM/yyyy') ?? '';

      case ColumnType.Datetime:
        return this.datePipe.transform(value as Date | string, 'dd/MM/yyyy hh:mm:ss') ?? '';

      case ColumnType.Currency:
        return this.currencyPipe.transform(value as number, 'BRL') ?? '';

      case ColumnType.Percent:
        return this.percentPipe.transform(value as number) ?? '';

      case ColumnType.Boolean:
        return value ? 'Sim' : 'Não';

      case ColumnType.Enum:
        return definition.enumOptionLabels?.[value as string] ?? String(value);

      default:
        return String(value);
    }
  }

  /**
   * Lê o valor de uma célula a partir da linha. Quando o `field` contém
   * pontos, o valor é resolvido como caminho aninhado (`state.name`), o que
   * permite colunas apontarem para propriedades de objetos relacionados.
   * Qualquer elo nulo do caminho devolve `undefined`.
   */
  resolve(record: unknown, field: string): unknown {
    if (record === null || record === undefined) {
      return undefined;
    }

    return field
      .split('.')
      .reduce<unknown>(
        (value: unknown, segment: string) =>
          value === null || value === undefined
            ? undefined
            : (value as Record<string, unknown>)[segment],
        record
      );
  }
}
