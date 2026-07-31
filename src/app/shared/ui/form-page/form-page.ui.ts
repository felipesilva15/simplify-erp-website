import { AfterContentInit, Component, ContentChildren, Input, input, InputSignal, QueryList, TemplateRef } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { BreadcrumbComponent } from '../../components/breadcrumb/breadcrumb.component';
import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { AppTemplate } from '../../directives/app-template';
import { CrudFormFacade } from '../../facades/crud-form.facade';
import { Message } from "primeng/message";

@Component({
  selector: 'app-form-page',
  imports: [
    BreadcrumbComponent,
    DatePipe,
    NgTemplateOutlet,
    Message
],
  templateUrl: './form-page.ui.html',
  styleUrl: './form-page.ui.scss',
})
export class FormPageUi implements AfterContentInit {
  title: InputSignal<string> = input.required<string>();
  breadcrumbItems: InputSignal<MenuItem[]> = input<MenuItem[]>([]);
  entity: InputSignal<any> = input<any>(null);

  @Input() facade?: CrudFormFacade<any>;

  @ContentChildren(AppTemplate)
  templates!: QueryList<AppTemplate>;

  contentTemplate!: TemplateRef<any> | null;

  ngAfterContentInit(): void {
    this.templates.forEach(template => {
      if (template.name === 'content') {
        this.contentTemplate = template.template;
      }
    });
  }
}
