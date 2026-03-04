import { Component, ContentChildren, input, InputSignal, QueryList, TemplateRef } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { AppTemplate } from '../../directives/app-template';
import { BreadcrumbComponent } from "../../components/breadcrumb/breadcrumb.component";
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-list-page',
  imports: [BreadcrumbComponent, NgTemplateOutlet],
  templateUrl: './list-page.ui.html',
  styleUrl: './list-page.ui.scss',
})
export class ListPageUi {
  title: InputSignal<string> = input.required<string>();
  breadcrumbItems: InputSignal<MenuItem[]> = input<MenuItem[]>([]);

  @ContentChildren(AppTemplate)
  templates!: QueryList<AppTemplate>;

  contentTemplate!: TemplateRef<any>;

  ngAfterContentInit(): void {
    this.templates.forEach(template => {
      if (template.name === 'content') {
        this.contentTemplate = template.template;
      }
    });
  }
}
