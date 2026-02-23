import { Component, input } from '@angular/core';

@Component({
  selector: 'app-splash-screen',
  imports: [],
  templateUrl: './splash-screen.component.html',
  styleUrl: './splash-screen.component.scss',
})
export class SplashScreenComponent {
  message = input<string>();
}
