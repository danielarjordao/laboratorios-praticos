import { Component, OnInit, OnDestroy, HostListener, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

import { GreetingPipe } from '../../utils/pipes/greeting-pipe';
import { Logo } from '../logo/logo';
import { Auth } from '../../services/auth';
import { ProfileService } from '../../services/profile';
import { AuthUser } from '../../models/authUser';
import { Profile } from '../../models/profile';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule, DatePipe, GreetingPipe, Logo],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Header implements OnInit, OnDestroy {
  private readonly authService = inject(Auth);
  private readonly profileService = inject(ProfileService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();
  private readonly darkThemeClass = 'dark';

  currentUser: AuthUser | null = null;
  userInitials = '';
  currentDate = new Date();
  activeProfile: Profile | null = null;
  availableProfiles: Profile[] = [];

  isUserMenuOpen = false;
  isProfileMenuOpen = false;
  isNavMenuOpen = false;
  isDarkMode = false;

  ngOnInit(): void {
    this.syncThemeFromBody();
    this.subscribeToUser();
    this.subscribeToProfiles();
    this.subscribeToActiveProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Alterna entre tema claro e escuro.
  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme();
  }

  // Seleciona um perfil e fecha menus abertos.
  selectProfile(profile: Profile): void {
    if (this.activeProfile?.id !== profile.id) {
      this.profileService.switchProfile(profile);
      this.activeProfile = profile;
    }

    this.closeAllMenus();
    this.cdr.markForCheck();
  }

  // Alterna menu de perfis.
  toggleProfileMenu(event: Event): void {
    event.stopPropagation();
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
    this.closeOtherMenus('profile');
  }

  // Alterna menu do usuario.
  toggleUserMenu(event: Event): void {
    event.stopPropagation();
    this.isUserMenuOpen = !this.isUserMenuOpen;
    this.closeOtherMenus('user');
  }

  // Alterna menu de navegacao mobile.
  toggleNavMenu(event: Event): void {
    event.stopPropagation();
    this.isNavMenuOpen = !this.isNavMenuOpen;
    this.closeOtherMenus('nav');
  }

  // Fecha menus em navegacoes por link.
  closeAllMenus(): void {
    this.isProfileMenuOpen = false;
    this.isUserMenuOpen = false;
    this.isNavMenuOpen = false;
    this.cdr.markForCheck();
  }

  // Fecha menus ao clicar fora.
  @HostListener('document:click')
  onDocumentClick(): void {
    if (this.isProfileMenuOpen || this.isUserMenuOpen || this.isNavMenuOpen) {
      this.closeAllMenus();
    }
  }

  // Encerra sessao e redireciona para login.
  async logout(): Promise<void> {
    await this.authService.signOut();
    this.closeAllMenus();
    this.router.navigate(['/auth/login']);
  }

  // Sincroniza o tema interno com o estado do body.
  private syncThemeFromBody(): void {
    this.isDarkMode = document.body.classList.contains(this.darkThemeClass);
    this.applyTheme();
  }

  // Aplica o tema atual ao body.
  private applyTheme(): void {
    document.body.classList.toggle(this.darkThemeClass, this.isDarkMode);
  }

  // Escuta alteracoes do usuario autenticado.
  private subscribeToUser(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        this.userInitials = this.getUserInitials(user);
        this.cdr.markForCheck();
      });
  }

  // Escuta lista de perfis disponiveis.
  private subscribeToProfiles(): void {
    this.profileService.allProfiles$
      .pipe(takeUntil(this.destroy$))
      .subscribe(profiles => {
        this.availableProfiles = profiles;

        if (profiles.length === 0) {
          this.activeProfile = null;
          this.isProfileMenuOpen = false;
        }

        this.cdr.markForCheck();
      });
  }

  // Escuta mudancas do perfil ativo.
  private subscribeToActiveProfile(): void {
    this.profileService.currentProfile$
      .pipe(takeUntil(this.destroy$))
      .subscribe(profile => {
        this.activeProfile = profile;
        this.cdr.markForCheck();
      });
  }

  // Fecha menus diferentes do menu selecionado.
  private closeOtherMenus(except: 'profile' | 'user' | 'nav'): void {
    if (except !== 'profile') {
      this.isProfileMenuOpen = false;
    }

    if (except !== 'user') {
      this.isUserMenuOpen = false;
    }

    if (except !== 'nav') {
      this.isNavMenuOpen = false;
    }

    this.cdr.markForCheck();
  }

  // Calcula iniciais do usuario para avatar.
  private getUserInitials(user: AuthUser | null): string {
    if (!user) {
      return '';
    }

    const first = user.firstName?.charAt(0) || '';
    const last = user.lastName?.charAt(0) || '';
    const initials = `${first}${last}`.trim().toUpperCase();

    if (initials) {
      return initials;
    }

    return user.email.charAt(0).toUpperCase();
  }
}
