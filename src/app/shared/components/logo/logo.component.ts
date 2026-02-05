import { Component, computed, Input, Signal } from '@angular/core';
import { LogoType } from '../../enums/logo-type';

@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [],
  templateUrl: './logo.component.html',
  styleUrl: './logo.component.scss',
})
export class LogoComponent {
  @Input() type: LogoType = LogoType.Extended;
  @Input({required: false}) height: string = '42px';
  fileBasePath: string = 'images';

  source: Signal<string> = computed(() => {
    return this.type == LogoType.Extended ? `${this.fileBasePath}/logo-extended.png` : `${this.fileBasePath}/logo-mini.png`
  })

  styleClass: Signal<string> = computed(() => {
    return this.type == LogoType.Extended ? 'logo-extended' : 'logo-mini'
  })
}
