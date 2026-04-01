import { Component, OnInit, OnDestroy, HostListener, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

import { GreetingPipe } from '../../utils/pipes/greeting-pipe';
import { Logo } from '../logo/logo';
import { Auth } from '../../services/auth';
import { ProfileService } from '../../services/profile';
import { SettingsService } from '../../services/settings';
import { PreferencesService } from '../../services/preferences';
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
  private readonly settingsService = inject(SettingsService);
  private readonly preferences = inject(PreferencesService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();

  currentUser: AuthUser | null = null;
  userInitials = '';
  currentDate = new Date();
  activeProfile: Profile | null = null;
  availableProfiles: Profile[] = [];

  isUserMenuOpen = false;
  isProfileMenuOpen = false;
  isNavMenuOpen = false;
  isDarkMode = false;
  private readonly disabledRoutes = new Set(['/budgets', '/forecast', '/goals', '/past-12-months']);
  private settingsLoadedForUserId: string | null = null;

  isNavDisabled(route: string): boolean {
    return this.disabledRoutes.has(route);
  }

  onNavLinkClick(event: Event, route: string): void {
    if (this.isNavDisabled(route)) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    this.closeAllMenus();
  }

  ngOnInit(): void {
    this.syncThemeWithPreferences();
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
    this.preferences.setTheme(this.isDarkMode ? 'dark' : 'light');

    if (this.currentUser?.id) {
      this.settingsService.upsertThemePreference(this.currentUser.id, this.isDarkMode ? 'dark' : 'light')
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          error: err => console.error('Failed to persist theme preference:', err),
        });
    }
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

  // Sincroniza o estado do botao de tema quando ajustes mudam o tema global.
  @HostListener('document:app-theme-changed')
  onThemeChanged(): void {
    this.isDarkMode = this.preferences.current.theme === 'dark'
      || (this.preferences.current.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    this.cdr.markForCheck();
  }

  // Encerra sessao e redireciona para login.
  async logout(): Promise<void> {
    await this.authService.signOut();
    this.closeAllMenus();
    this.router.navigate(['/auth/login']);
  }

  // Sincroniza estado local do botao com o tema global.
  private syncThemeWithPreferences(): void {
    const currentTheme = this.preferences.current.theme;
    this.isDarkMode = currentTheme === 'dark'
      || (currentTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  }

  // Escuta alteracoes do usuario autenticado.
  private subscribeToUser(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        this.userInitials = this.getUserInitials(user);

        if (!user?.id) {
          this.settingsLoadedForUserId = null;
        }

        if (user?.id && this.settingsLoadedForUserId !== user.id) {
          this.settingsLoadedForUserId = user.id;
          this.settingsService.getUserSettings(user.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: settings => {
                this.preferences.applyFromSettings(settings.theme, settings.currency, settings.language);
                this.syncThemeWithPreferences();
                this.cdr.markForCheck();
              },
              error: () => {
                this.syncThemeWithPreferences();
                this.cdr.markForCheck();
              },
            });
        }

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
