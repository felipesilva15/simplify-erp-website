import { describe, expect, it } from 'vitest';
import { createRunner, createTree } from '../testing/helpers';

const runner = createRunner();
const LOOKUP = '/src/app/features/third-party/partner-types/components/partner-type-lookup/partner-type-lookup.component.ts';

describe('lookup schematic', () => {
  it('gera o componente de lookup com CVA', async () => {
    const tree = createTree();
    const result = await runner.runSchematic('lookup', { module: 'third-party', name: 'partner-type' }, tree);

    const ts = result.readContent(LOOKUP);
    expect(ts).toContain('export class PartnerTypeLookupComponent');
    expect(ts).toContain('NG_VALUE_ACCESSOR');
    expect(ts).toContain('LookupFacade');
    expect(ts).toContain('writeValue(value: LookupItem | LookupItem[] | null)');
    expect(ts).toContain('eslint-disable-next-line @angular-eslint/no-forward-ref');

    const html = result.readContent(
      '/src/app/features/third-party/partner-types/components/partner-type-lookup/partner-type-lookup.component.html',
    );
    expect(html).toContain('<app-lookup');
    expect(html).toContain('(selected)="selected.emit($event)"');

    expect(
      result.exists(
        '/src/app/features/third-party/partner-types/components/partner-type-lookup/partner-type-lookup.component.spec.ts',
      ),
    ).toBe(true);
  });
});
