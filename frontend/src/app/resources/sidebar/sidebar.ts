import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css'],
})
export class Sidebar {
  private readonly disabledRoutes = new Set(['/budgets', '/forecast', '/goals', '/past-12-months']);

  // Verifica se a rota de navegação está desabilitada, para evitar que o usuário acesse funcionalidades ainda não implementadas.
  isNavDisabled(route: string): boolean {
    return this.disabledRoutes.has(route);
  }

  // Manipula cliques em links de navegação, prevenindo a navegação para rotas desabilitadas e fechando menus abertos.
  onNavClick(event: Event, route: string): void {
    if (!this.isNavDisabled(route)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
  }
}
