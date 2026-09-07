import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

/**
 * Notifica páginas (ex.: listagens) que um dialog/rota-dialog recém-fechado
 * salvou dados com sucesso, para que possam recarregar a consulta.
 *
 * O evento é emitido SOMENTE em salvamento bem-sucedido (não em cancelar/fechar).
 */
@Injectable({
  providedIn: 'root',
})
export class DialogRefreshService {
  private readonly savedSubject: Subject<void> = new Subject<void>();

  readonly saved$: Observable<void> = this.savedSubject.asObservable();

  notifySaved(): void {
    this.savedSubject.next();
  }
}