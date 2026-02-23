import { Component, Input, signal, WritableSignal } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../core/models/api-response';

@Component({
  selector: 'app-master-list',
  imports: [],
  templateUrl: './master-list.component.html',
  styleUrl: './master-list.component.scss',
})
export class MasterListComponent {
  @Input() listFn!: (params: any) => Observable<ApiResponse<any>>;

  response!: ApiResponse<any>;
  isLoading: WritableSignal<boolean> = signal<boolean>(true);

  loadInfo(): void {
    this.isLoading.set(true);

    const requestParams = {};

    this.listFn(requestParams).subscribe({
      next: (res: ApiResponse<any>) => {
        this.response = res;
        this.isLoading.set(false);
      }
    });
  }
}
