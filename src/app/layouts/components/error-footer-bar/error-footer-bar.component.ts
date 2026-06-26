import { DatePipe, LowerCasePipe } from '@angular/common';
import { Component, OnInit, signal, WritableSignal } from '@angular/core';

@Component({
  selector: 'app-error-footer-bar',
  imports: [
    DatePipe,
    LowerCasePipe
  ],
  templateUrl: './error-footer-bar.component.html',
  styleUrl: './error-footer-bar.component.scss',
})
export class ErrorFooterBarComponent implements OnInit {
  accessDate: WritableSignal<Date> = signal<Date>(new Date())
  username: WritableSignal<string> = signal<string>('')
  ip: WritableSignal<string> = signal<string>('192.168.0.1')

  constructor() { }

  ngOnInit(): void {
    if (history.state?.username) {
      this.username.set(history.state?.username ?? '');
    }
  }
}
