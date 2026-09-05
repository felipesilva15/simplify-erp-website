import { Subject } from "rxjs";

export class DrawerRef<T = any> {
  private _onClose = new Subject<T | undefined>();

  onClose = this._onClose.asObservable();

  close(result?: T): void {
    this._onClose.next(result);
    this._onClose.complete();
  }
}