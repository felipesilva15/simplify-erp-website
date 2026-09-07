import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormDialogUi } from './form-dialog.ui';
import { Component, QueryList, TemplateRef } from '@angular/core';
import { By } from '@angular/platform-browser';
import { AppTemplate } from '../../directives/app-template';

describe('FormDialogUi', () => {
  let component: FormDialogUi;
  let fixture: ComponentFixture<FormDialogUi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormDialogUi],
    }).compileComponents();

    fixture = TestBed.createComponent(FormDialogUi);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not render footer when not provided', () => {
    component.footerTemplate = null;
    fixture.detectChanges();

    const footerElement = fixture.debugElement.query(By.css('.form-dialog-footer'));

    expect(footerElement).not.toBeTruthy();
  });

  describe('ngAfterContentInit', () => {
    function mockAppTemplate(name: string): AppTemplate {
      return {
        name,
        template: {} as TemplateRef<any>,
      } as unknown as AppTemplate;
    }

    function setTemplates(templates: AppTemplate[]): void {
      component.templates = new QueryList<AppTemplate>();
      component.templates.reset(templates);
    }

    it('should define contentTemplate for template named "content"', () => {
      const contentTpl = mockAppTemplate('content');
      setTemplates([contentTpl]);

      component.ngAfterContentInit();

      expect(component.contentTemplate).toBe(contentTpl.template);
    });

    it('should define footerTemplate for template named "footer"', () => {
      const footerTpl = mockAppTemplate('footer');
      setTemplates([footerTpl]);

      component.ngAfterContentInit();

      expect(component.footerTemplate).toBe(footerTpl.template);
    });

    it('should not define footer when no template is named "footer"', () => {
      setTemplates([mockAppTemplate('content')]);

      component.ngAfterContentInit();

      expect(component.footerTemplate).toBeNull();
    });

    it('should not throw an error when templates is empty', () => {
      setTemplates([]);

      expect(() => component.ngAfterContentInit()).not.toThrow();
      expect(component.contentTemplate).toBeUndefined();
      expect(component.footerTemplate).toBeNull();
    });
  });

  describe('should render the projected content and footer', () => {
    @Component({
      standalone: true,
      imports: [FormDialogUi, AppTemplate],
      template: `
        <app-form-dialog>
          <ng-template appTemplate="content">
            <p id="projected-content">Conteúdo projetado</p>
          </ng-template>
          <ng-template appTemplate="footer">
            <button id="projected-footer">Salvar</button>
          </ng-template>
        </app-form-dialog>
      `,
    })
    class HostComponent {}

    let hostFixture: ComponentFixture<HostComponent>;

    beforeEach(async () => {
      hostFixture = TestBed.createComponent(HostComponent);
      hostFixture.detectChanges();
    });

    it('should render the projected content', () => {
      const projected = hostFixture.debugElement.query(By.css('#projected-content'));
      expect(projected).not.toBeNull();
      expect(projected.nativeElement.textContent).toContain('Conteúdo projetado');
    });

    it('should render the projected footer', () => {
      const footer = hostFixture.debugElement.query(By.css('#projected-footer'));
      expect(footer).not.toBeNull();
    });
  });
});