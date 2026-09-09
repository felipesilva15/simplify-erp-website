import { AfterContentInit, Component, ContentChildren, Input, QueryList, TemplateRef } from '@angular/core';
import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { AppTemplate } from '../../directives/app-template';
import { MessageModule } from "primeng/message";
import { FormPageFacade } from '../../../core/contracts/form-page-facade';

@Component({
  selector: 'app-form-dialog',
  imports: [
    NgTemplateOutlet,
    MessageModule,
    DatePipe
  ],
  templateUrl: './form-dialog.ui.html',
  styleUrl: './form-dialog.ui.scss',
})
export class FormDialogUi implements AfterContentInit {
  @Input() facade?: FormPageFacade<any>;

  @ContentChildren(AppTemplate)
  templates!: QueryList<AppTemplate>;

  contentTemplate!: TemplateRef<any> | null;
  footerTemplate: TemplateRef<any> | null = null;

  ngAfterContentInit(): void {
    this.templates.forEach(template => {
      switch (template.name) {
        case 'content':
          this.contentTemplate = template.template;
          break;
        case 'footer':
          this.footerTemplate = template.template;
          break;
      }
    });
  }
}