import { Injectable, Type } from '@angular/core';
import { DynamicDialogConfig } from '../../core/models/dynamic-dialog-config';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DialogSize } from '../../core/enums/dialog-size';

type DialogBeakpoints = Record<string, any>;

@Injectable({
  providedIn: 'root',
})
export class DynamicDialogService {
  ref!: DynamicDialogRef | null;
  
  constructor(private dialogService: DialogService) {}

  open<T>(componentType: Type<any>, config: DynamicDialogConfig): Promise<T> {
    const width: string = this.getWidthBySize(config.size);

    this.ref = this.dialogService.open(componentType, {
      header: config.title,
      modal: true, 
      data: config.data,
      width: width,
      closable: config.closeable,
      styleClass: config.styleClass,
      contentStyle: { 
        overflow: 'auto' 
      },
      breakpoints: this.getBreakpointsByWidth(width)
    });

    return new Promise<T>((resolve, reject) => {
      this.ref?.onClose.subscribe({
        next: (response: T) => {
          resolve(response);
        },
        error: (error: any) => {
          reject(error);
        }
      });
    });
  }

  private getWidthBySize(size?: DialogSize): string {
    let width: string;

    switch (size) {
      case 'lg':
        width = '1020px';
        break;

      case 'md':
        width = '840px';
        break;
    
      default:
        width = '500px';
        break;
    }

    return width;
  }

  private getBreakpointsByWidth(width: string): DialogBeakpoints {
    const margin: string = '5vw';
    const breakpointName: string = `calc(${width} + ${margin})`;

    const breakpoints: DialogBeakpoints = {};
    breakpoints[breakpointName] = '95vw';

    return breakpoints;
  }
}
