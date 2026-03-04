import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
  selector: '[appTemplate]',
})
export class AppTemplate {
  @Input('appTemplate') name!: string;

  constructor(public template: TemplateRef<any>) { }
}
