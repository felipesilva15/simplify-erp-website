import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TextareaModule } from 'primeng/textarea';
import { PaginatorModule } from 'primeng/paginator';
import { FluidModule } from 'primeng/fluid';
import { ChildEntityForm } from '../../../../../core/contracts/child-entity-form';
import { ChildRowErrors } from '../../../../../core/models/child-row-errors';
import { CHILD_FORM_ERRORS, CHILD_FORM_ITEM, CHILD_ITEM_EDITOR } from '../../../../../core/models/child-form-tokens';
import { Contact } from '../../models/contact';
import { FormControlErrorsComponent } from '../../../../../shared/components/form-control-errors/form-control-errors.component';

@Component({
  selector: 'app-contact-form',
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    ToggleSwitchModule,
    TextareaModule,
    PaginatorModule,
    FluidModule,
    FormControlErrorsComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './contact-form.component.html',
})
export class ContactFormComponent implements ChildEntityForm<Contact> {
  private readonly fb: FormBuilder = inject(FormBuilder);
  readonly item: Signal<Contact | null> = inject(CHILD_FORM_ITEM) as Signal<Contact | null>;
  readonly errors: Signal<ChildRowErrors> = inject(CHILD_FORM_ERRORS) as Signal<ChildRowErrors>;
  readonly editor = inject(CHILD_ITEM_EDITOR);

  readonly form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    position: [''],
    phone: ['', Validators.required],
    email: ['', [Validators.email]],
    is_primary: [false],
    notes: [''],
  });

  constructor() {
    this.hydrateForm(this.item());
  }

  isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    const item = this.item();
    const payload = this.form.value as Partial<Contact>;

    const merged: Contact = {
      ...(item ?? ({ id: 0 } as Contact)),
      ...payload,
    } as Contact;

    this.editor.commit(merged);
  }

  cancel(): void {
    this.editor.close();
  }

  /**
   * Carrega o item em edição no formulário. O componente é criado dinamicamente
   * a cada abertura do modal, então o patch acontece uma única vez, antes de o
   * shell aplicar os erros da API — assim os `valueChanges` gerados aqui não
   * limpam os erros recém-aplicados.
   */
  private hydrateForm(item: Contact | null): void {
    if (!item) {
      return;
    }

    this.form.patchValue({
      name: item.name ?? '',
      position: item.position ?? '',
      phone: item.phone ?? '',
      email: item.email ?? '',
      is_primary: item.is_primary ?? false,
      notes: item.notes ?? '',
    });

    this.form.markAsUntouched();
    this.form.markAsPristine();
  }
}
