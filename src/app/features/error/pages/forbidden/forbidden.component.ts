import { Component } from '@angular/core';
import { DividerModule } from 'primeng/divider';
import { MessageModule } from 'primeng/message';
import { ButtonDirective, ButtonModule } from "primeng/button";
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forbidden',
  imports: [
    DividerModule,
    MessageModule,
    ButtonModule,
    RouterLink
],
  templateUrl: './forbidden.component.html',
  styleUrl: './forbidden.component.scss',
})
export class ForbiddenComponent {

}
