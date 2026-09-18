import { AfterContentInit, Component, ContentChildren, Input, input, InputSignal, QueryList, TemplateRef, inject } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { BreadcrumbComponent } from '../../components/breadcrumb/breadcrumb.component';
import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { AppTemplate } from '../../directives/app-template';
import { Message } from "primeng/message";
import { TooltipModule } from 'primeng/tooltip';
import { FormPageFacade } from '../../../core/contracts/form-page-facade';
import { DynamicDrawerService } from '../../services/dynamic-drawer-service';
import { EntityActivityLogListDrawer } from '../../components/entity-activity-log-list/entity-activity-log-list.drawer';
import { EntityActivityLogData } from '../../../core/models/entity-activity-log-data';
import { Position } from '../../../core/enums/position';

@Component({
  selector: 'app-form-page',
  imports: [
    BreadcrumbComponent,
    DatePipe,
    NgTemplateOutlet,
    Message,
    TooltipModule
],
  templateUrl: './form-page.ui.html',
  styleUrl: './form-page.ui.scss',
})
export class FormPageUi implements AfterContentInit {
  title: InputSignal<string> = input.required<string>();
  breadcrumbItems: InputSignal<MenuItem[]> = input<MenuItem[]>([]);
  entity: InputSignal<any> = input<any>(null);

  @Input() facade?: FormPageFacade<any>;

  private dynamicDrawerService = inject(DynamicDrawerService);

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

  onActivityLog(): void {
    const facade = this.facade;
    const entity = facade?.entity();
    if (!facade || !facade.hasActivityLogsMethod() || entity?.id == null) {
      return;
    }

    const data: EntityActivityLogData = {
      entityId: entity.id as number,
      loadLogs: () => {
        const observable = facade.loadLogs();
        if (!observable) {
          throw new Error('Histórico de atividade não disponível para este processo.');
        }
        return observable;
      },
    };

    this.dynamicDrawerService.open(EntityActivityLogListDrawer, {
      data,
      header: 'Histórico de atividade',
      position: Position.Right,
      styleClass: 'w-full md:w-8 lg:w-4',
    });
  }
}