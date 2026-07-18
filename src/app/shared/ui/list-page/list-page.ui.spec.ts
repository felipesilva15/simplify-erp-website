import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListPageUi } from './list-page.ui';
import { Component, QueryList, TemplateRef } from '@angular/core';
import { BreadcrumbComponent } from '../../components/breadcrumb/breadcrumb.component';
import { By } from '@angular/platform-browser';
import { DatePipe } from '@angular/common';
import { MenuItem } from 'primeng/api';
import { AppTemplate } from '../../directives/app-template';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  template: '',
  inputs: ['items'],
})
class MockBreadcrumbComponent { }

describe('ListPageUi', () => {
  let component: ListPageUi;
  let fixture: ComponentFixture<ListPageUi>;
let pageTitle: string = 'Test Page Title';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListPageUi]
    })
    .overrideComponent(ListPageUi, {
      remove: {
        imports: [BreadcrumbComponent],
      },
      add: {
        imports: [MockBreadcrumbComponent],
      },
    })
    .compileComponents();;

    fixture = TestBed.createComponent(ListPageUi);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('title', pageTitle);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render title', () => {
    const titleElement = fixture.debugElement.query(By.css('h2'));

    expect(titleElement).toBeTruthy();
    expect(titleElement.nativeElement.textContent).toContain(pageTitle);
  });

  it('should render breadcrumb', () => {
    const breadcrumbItems: MenuItem[] = [
      { label: 'Home', routerLink: '/' },
      { label: 'Test Page', routerLink: '/test' }
    ];
    fixture.componentRef.setInput('breadcrumbItems', breadcrumbItems);
    fixture.detectChanges();

    const breadcrumbElement = fixture.debugElement.query(By.css('app-breadcrumb'));

    expect(breadcrumbElement).toBeTruthy();
    expect(breadcrumbElement.componentInstance.items).toEqual(breadcrumbItems);
  });

  it('should not render content template when not provided', () => {
    component.contentTemplate = null;
    const contentTemplateElement = fixture.debugElement.query(By.css('ng-container'));

    expect(contentTemplateElement).not.toBeTruthy();
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
 
    it('should choose the correct template among several projected', () => {
      const headerTpl = mockAppTemplate('header');
      const contentTpl = mockAppTemplate('content');
      const footerTpl = mockAppTemplate('footer');
      setTemplates([headerTpl, contentTpl, footerTpl]);
 
      component.ngAfterContentInit();
 
      expect(component.contentTemplate).toBe(contentTpl.template);
    });
 
    it('should not define contentTemplate when no template is named "content"', () => {
      setTemplates([mockAppTemplate('header'), mockAppTemplate('footer')]);
 
      component.ngAfterContentInit();
 
      expect(component.contentTemplate).toBeUndefined();
    });
 
    it('should not throw an error when templates is empty', () => {
      setTemplates([]);
 
      expect(() => component.ngAfterContentInit()).not.toThrow();
      expect(component.contentTemplate).toBeUndefined();
    });
 
    it('should use the last "content" template if there are multiple (current behavior of forEach)', () => {
      const first = mockAppTemplate('content');
      const second = mockAppTemplate('content');
      setTemplates([first, second]);
 
      component.ngAfterContentInit();
 
      // Documenta o comportamento real: como o forEach não dá break,
      // o último template com name === 'content' "vence".
      expect(component.contentTemplate).toBe(second.template);
    });
  });
 
  describe('should render the projected content (By ng-container)', () => {
    @Component({
      standalone: true,
      imports: [ListPageUi, AppTemplate],
      template: `
        <app-list-page [title]="'Host'">
          <ng-template appTemplate="content">
            <p id="projected-content">Conteúdo projetado</p>
          </ng-template>
        </app-list-page>
      `,
    })
    class HostComponent {}
 
    let hostFixture: ComponentFixture<HostComponent>;
 
    beforeEach(async () => {
      hostFixture = TestBed.createComponent(HostComponent);
      hostFixture.detectChanges();
    });
 
    it('deve renderizar o conteúdo projetado dentro do list-page', () => {
      const projected = hostFixture.debugElement.query(By.css('#projected-content'));
      expect(projected).not.toBeNull();
      expect(projected.nativeElement.textContent).toContain('Conteúdo projetado');
    });
  });
});
