import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ConfirmationService } from 'primeng/api';

import { ContactFormComponent } from './contact-form.component';
import { Contact } from '../../models/contact';
import { ChildItemEditor } from '../../../../../core/contracts/child-item-editor';
import { CHILD_FORM_ERRORS, CHILD_FORM_ITEM, CHILD_ITEM_EDITOR } from '../../../../../core/models/child-form-tokens';
import { ChildRowErrors } from '../../../../../core/models/child-row-errors';

describe('ContactFormComponent', () => {
  const existingContact: Contact = {
    id: 7,
    name: 'Maria Silva',
    position: 'Gerente',
    phone: '11988887777',
    email: 'maria@acme.com',
    is_primary: true,
    notes: 'Nota interna',
  };

  let commit: ChildItemEditor<Contact>['commit'];
  let close: ChildItemEditor<Contact>['close'];

  function setup(item: Contact | null): ContactFormComponent {
    commit = vi.fn();
    close = vi.fn();

    TestBed.configureTestingModule({
      imports: [ContactFormComponent],
      providers: [
        { provide: CHILD_ITEM_EDITOR, useValue: { commit, close } },
        { provide: CHILD_FORM_ITEM, useValue: signal<Contact | null>(item) },
        {
          provide: CHILD_FORM_ERRORS,
          useValue: signal<ChildRowErrors>({ fields: {}, messages: [] }),
        },
        { provide: ConfirmationService, useValue: { confirm: vi.fn() } },
      ],
    });

    const fixture = TestBed.createComponent(ContactFormComponent);
    fixture.detectChanges();

    return fixture.componentInstance;
  }

  afterEach(() => TestBed.resetTestingModule());

  it('should start blank when creating', () => {
    const component = setup(null);

    expect(component.item()).toBeNull();
    expect(component.form.getRawValue()).toEqual({
      name: '',
      position: '',
      phone: '',
      email: '',
      is_primary: false,
      notes: '',
    });
  });

  it('should patch the item being edited', () => {
    const component = setup(existingContact);

    expect(component.form.getRawValue()).toEqual({
      name: 'Maria Silva',
      position: 'Gerente',
      phone: '11988887777',
      email: 'maria@acme.com',
      is_primary: true,
      notes: 'Nota interna',
    });
  });

  it('should patch optional fields as empty when absent', () => {
    const component = setup({ id: 3, name: 'João', phone: '11', is_primary: false });

    expect(component.form.get('email')?.value).toBe('');
    expect(component.form.get('position')?.value).toBe('');
    expect(component.form.get('notes')?.value).toBe('');
  });

  it('should keep the item pristine after the patch', () => {
    const component = setup(existingContact);

    expect(component.form.pristine).toBe(true);
    expect(component.form.untouched).toBe(true);
  });

  it('should commit the merged item preserving the id', () => {
    const component = setup(existingContact);

    component.form.patchValue({ name: 'Maria Souza' });
    component.submit();

    expect(commit).toHaveBeenCalledWith({ ...existingContact, name: 'Maria Souza' });
  });

  it('should not commit an invalid form', () => {
    const component = setup(null);

    component.submit();

    expect(commit).not.toHaveBeenCalled();
    expect(component.form.touched).toBe(true);
  });

  it('should reject an invalid email', () => {
    const component = setup(null);

    component.form.patchValue({ name: 'X', phone: '11', email: 'invalido' });
    component.submit();

    expect(commit).not.toHaveBeenCalled();
  });

  it('should close the editor on cancel', () => {
    const component = setup(existingContact);

    component.cancel();

    expect(close).toHaveBeenCalled();
  });
});