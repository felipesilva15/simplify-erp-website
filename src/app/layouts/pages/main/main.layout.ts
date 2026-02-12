import { Component } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { SidebarComponent } from "../../components/sidebar/sidebar.component";
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main',
  imports: [NavbarComponent, SidebarComponent, RouterOutlet],
  templateUrl: './main.layout.html',
  styleUrl: './main.layout.scss',
})
export class MainLayout {

}
