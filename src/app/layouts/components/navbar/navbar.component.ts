import { Component } from '@angular/core';
import { LogoComponent } from '../../../shared/components/logo/logo.component';
import { LogoType } from '../../../shared/enums/logo-type';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-navbar',
  imports: [ButtonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  logoType: LogoType = LogoType.Mini;
}
