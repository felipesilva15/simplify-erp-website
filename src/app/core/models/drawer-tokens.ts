import { InjectionToken } from '@angular/core';
import { DrawerRef } from '../lib/drawer-ref';
import { DrawerConfig } from './drawer-config';

/**
 * Token para injetar o `DrawerRef` no componente instanciado dentro do p-drawer,
 * permitindo que ele se feche (análogo ao DynamicDialogRef).
 */
export const DRAWER_REF = new InjectionToken<DrawerRef>('DRAWER_REF');

/**
 * Token para injetar a configuração original (incluindo `data`) no componente do drawer,
 * análogo ao DynamicDialogConfig do PrimeNG.
 */
export const DRAWER_CONFIG = new InjectionToken<DrawerConfig>('DRAWER_CONFIG');
