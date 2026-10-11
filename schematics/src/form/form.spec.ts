import { describe, expect, it } from 'vitest';
import { createRunner, createTree } from '../testing/helpers';

const runner = createRunner();
const BASE = '/src/app/features/third-party/partner-types/pages/partner-type-form';

describe('form schematic', () => {
  it('gera o dialog por padrão', async () => {
    const tree = createTree();
    const result = await runner.runSchematic(
      'form',
      { module: 'third-party', name: 'partner-type', fields: 'name:string:Nome,active:boolean:Ativo' },
      tree,
    );

    const ts = result.readContent(`${BASE}/partner-type-form.dialog.ts`);
    expect(ts).toContain('export class PartnerTypeFormDialog');
    expect(ts).toContain('new GenericCrudFormFacade<PartnerType>');
    expect(ts).toContain("create: 'partnerTypes.create'");
    expect(ts).toContain("update: 'partnerTypes.update'");
    expect(ts).toContain('name: [\'\', [Validators.required, Validators.maxLength(255)]],');
    expect(ts).toContain('active: [false, [Validators.required]],');
    expect(ts).toContain('DynamicDialogConfig');

    const html = result.readContent(`${BASE}/partner-type-form.dialog.html`);
    expect(html).toContain('<app-form-dialog [facade]="facade">');
    expect(html).toContain('formControlName="name"');
    expect(html).toContain('<p-toggleswitch');

    expect(result.exists(`${BASE}/partner-type-form.dialog.spec.ts`)).toBe(true);
  });

  it('gera uma página quando --form-type=page', async () => {
    const tree = createTree();
    const result = await runner.runSchematic(
      'form',
      { module: 'third-party', name: 'partner-type', 'form-type': 'page' },
      tree,
    );

    const ts = result.readContent(`${BASE}/partner-type-form.page.ts`);
    expect(ts).toContain('export class PartnerTypeFormPage');
    expect(ts).toContain('FormPageUi');

    const html = result.readContent(`${BASE}/partner-type-form.page.html`);
    expect(html).toContain('<app-form-page');
    expect(html).toContain('facade.navigateBack(form)');

    expect(result.exists(`${BASE}/partner-type-form.dialog.ts`)).toBe(false);
  });

  it('tipa datas com FormControl<Date | null>', async () => {
    const tree = createTree();
    const result = await runner.runSchematic(
      'form',
      { module: 'third-party', name: 'partner-type', fields: 'started_at:date' },
      tree,
    );

    const ts = result.readContent(`${BASE}/partner-type-form.dialog.ts`);
    expect(ts).toContain('started_at: FormControl<Date | null>;');
    expect(ts).toContain('started_at: new FormControl<Date | null>(null, [Validators.required]),');
    expect(ts).toContain("import { DatePickerModule } from 'primeng/datepicker';");
  });
});
