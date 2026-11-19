import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MenuItem } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
import { BaseEntity } from '../../../core/models/base-entity';
import { CrudListFacade } from '../../facades/crud-list.facade';

/**
 * Barra de ações compartilhada pelas listagens (tabela plana ou em árvore).
 * Recebe o facade apenas para ler estado/permissões; todas as ações são
 * emitidas como eventos para o componente que a utiliza.
 */
@Component({
  selector: 'app-list-toolbar',
  imports: [
    RouterLink,
    ButtonModule,
    TooltipModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    FormsModule
  ],
  templateUrl: './list-toolbar.component.html',
  styleUrl: './list-toolbar.component.scss',
})
export class ListToolbarComponent {
  facade = input.required<CrudListFacade<BaseEntity>>();
  enableSearch = input<boolean>(false);
  enableSelection = input<boolean>(false);
  searchPlaceholder = input<string>('Buscar...');
  searchTerm = input<string>('');
  formRoute = input<string>('new');
  selectedCount = input<number>(0);
  exportMenuItems = input<MenuItem[]>([]);

  searchInput = output<string>();
  searchClear = output<void>();
  refresh = output<void>();
  exportClick = output<Event>();
}
