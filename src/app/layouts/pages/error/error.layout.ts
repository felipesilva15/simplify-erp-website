import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ErrorFooterBarComponent } from "../../components/error-footer-bar/error-footer-bar.component";

@Component({
  selector: 'app-error',
  imports: [RouterOutlet, ErrorFooterBarComponent],
  templateUrl: './error.layout.html',
  styleUrl: './error.layout.scss',
})
export class ErrorLayout {

}
