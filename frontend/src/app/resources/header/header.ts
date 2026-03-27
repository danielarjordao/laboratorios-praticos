import { Component, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { GreetingPipe } from '../../utils/pipes/greeting-pipe';
import { Logo } from '../logo/logo';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule, DatePipe, GreetingPipe, Logo],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header {
  Auth = Auth; // Para usar os métodos de autenticação no template
  userName: string = '';
  userSurname: string = '';
  userInitials: string = '';
  userEmail: string = '';


  async ngOnInit() {
    // Verifica se o utilizador está logado e, se não estiver, redireciona para a página de login
    const authService = new Auth();
    const user = await authService.getCurrentUser();
    if (user) {
      this.userName = user.user_metadata['first_name'] || '';
      this.userSurname = user.user_metadata['last_name'] || '';
      this.userEmail = user.email || '';
      this.userInitials = `${this.userName.charAt(0)}${this.userSurname.charAt(0)}`;
    }
  }

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

  logout() {
    const authService = new Auth();
    authService.signOut().then(() => {
      // Redireciona para a página de login após o logout
      window.location.href = '/auth/login';
    });
  }
}
