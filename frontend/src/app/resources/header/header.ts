import { Component, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { GreetingPipe } from '../../utils/pipes/greeting-pipe';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule, DatePipe, GreetingPipe],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header {
  // Dados do utilizador
  // TODO: Estes dados devem ser obtidos a partir de um serviço de autenticação real
  userName: string = 'Daniela';
  userFullName: string = 'Daniela Jordão';
  userEmail: string = 'appfinancas.suporte@gmail.com';
  userInitial: string = this.userName.charAt(0).toUpperCase();

  // Data atual para exibir no header
  currentDate = new Date();

  // Perfis disponíveis e perfil ativo
  // TODO: Estes dados devem ser obtidos a partir de um serviço de utilizadores real, permitindo que o utilizador tenha múltiplos perfis e possa alternar entre eles
  activeProfile: string = 'Personal';
  availableProfiles: string[] = ['Personal', 'Freelance', 'Business'];

  // Estados para controlar a visibilidade dos menus dropdown
  isUserMenuOpen: boolean = false;
  isProfileMenuOpen: boolean = false;
  isNavMenuOpen: boolean = false;
  isDarkMode: boolean = false;

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;

    // Adiciona ou remove a classe 'dark' no body, que ativa as tuas variáveis do Figma
    if (this.isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }

  changeProfile(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.activeProfile = selectElement.value;
    // No futuro: this.apiService.loadTransactionsForProfile(this.activeProfile);
  }

  toggleProfileMenu(event: Event) {
    event.stopPropagation(); // Impede o clique de chegar ao HostListener
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
    this.isUserMenuOpen = false; // Fecha o outro menu se estiver aberto
    this.isNavMenuOpen = false; // Fecha o menu de navegação se estiver aberto
  }

  toggleUserMenu(event: Event) {
    event.stopPropagation(); // Impede o clique de chegar ao HostListener
    this.isUserMenuOpen = !this.isUserMenuOpen;
    this.isProfileMenuOpen = false; // Fecha o outro menu se estiver aberto
    this.isNavMenuOpen = false; // Fecha o menu de navegação se estiver aberto
  }

  toggleNavMenu(event: Event) {
    event.stopPropagation();
    this.isNavMenuOpen = !this.isNavMenuOpen;
    this.isProfileMenuOpen = false;
    this.isUserMenuOpen = false;
  }

  selectProfile(profile: string) {
    this.activeProfile = profile;
    this.isProfileMenuOpen = false;
    this.isNavMenuOpen = false;
  }

  // Fecha os menus dropdown quando o utilizador clicar fora deles
  @HostListener('document:click')
  onDocumentClick() {
    this.isProfileMenuOpen = false;
    this.isUserMenuOpen = false;
    this.isNavMenuOpen = false;
  }
}
