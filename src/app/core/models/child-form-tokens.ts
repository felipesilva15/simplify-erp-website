import { InjectionToken, Signal } from '@angular/core';
import { ChildItemEditor } from '../contracts/child-item-editor';
import { ChildRowErrors } from './child-row-errors';

/**
 * Tokens entregues ao componente de formulário de um item filho pelo
 * `ChildFormOutletDirective`, análoga ao `DRAWER_REF`/`DRAWER_CONFIG` do
 * `DrawerOutletDirective`.
 */
export const CHILD_FORM_ITEM = new InjectionToken<Signal<unknown>>('CHILD_FORM_ITEM');

export const CHILD_FORM_ERRORS = new InjectionToken<Signal<ChildRowErrors>>('CHILD_FORM_ERRORS');

export const CHILD_ITEM_EDITOR = new InjectionToken<ChildItemEditor<unknown>>('CHILD_ITEM_EDITOR');
