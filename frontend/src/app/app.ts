import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { Sidebar } from './resources/sidebar/sidebar';
import { Header } from './resources/header/header';
import { Footer } from './resources/footer/footer';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Sidebar, Header, Footer],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  private router = inject(Router);
  showSidebar = true;

  constructor() {
    // Fica à escuta das mudanças de URL
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Esconde a sidebar se o URL for o login
      this.showSidebar = !event.url.includes('/auth/login');
    });
  }
}
