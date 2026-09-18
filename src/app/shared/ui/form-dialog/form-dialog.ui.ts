import { AfterContentInit, Component, ContentChildren, Input, QueryList, TemplateRef, inject } from '@angular/core';
import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { AppTemplate } from '../../directives/app-template';
import { MessageModule } from "primeng/message";
import { TooltipModule } from 'primeng/tooltip';
import { FormPageFacade } from '../../../core/contracts/form-page-facade';
import { DynamicDrawerService } from '../../services/dynamic-drawer-service';
import { EntityActivityLogListDrawer } from '../../components/entity-activity-log-list/entity-activity-log-list.drawer';
import { EntityActivityLogData } from '../../../core/models/entity-activity-log-data';
import { Position } from '../../../core/enums/position';

@Component({
  selector: 'app-form-dialog',
  imports: [
    NgTemplateOutlet,
    MessageModule,
    TooltipModule,
    DatePipe
  ],
  templateUrl: './form-dialog.ui.html',
  styleUrl: './form-dialog.ui.scss',
})
export class FormDialogUi implements AfterContentInit {
  @Input() facade?: FormPageFacade<any>;

  private dynamicDrawerService = inject(DynamicDrawerService);

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