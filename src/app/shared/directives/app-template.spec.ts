import { TemplateRef } from '@angular/core';
import { AppTemplate } from './app-template';

describe('AppTemplate', () => {
  it('should create an instance', () => {
    const template = new TemplateRef();
    const directive = new AppTemplate(template);
    expect(directive).toBeTruthy();
  });
});
