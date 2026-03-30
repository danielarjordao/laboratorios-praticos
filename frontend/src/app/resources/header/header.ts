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
  // CRITICAL: Since we use markForCheck(), we must explicitly tell Angular to use OnPush.
  // This optimizes performance and prevents silent UI update failures.
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Header implements OnInit, OnDestroy {
  // Services
  private authService = inject(Auth);
  private profileService = inject(ProfileService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  // User and Profile Data
  currentUser: AuthUser | null = null;
  userInitials: string = '';
  currentDate = new Date();
  activeProfile: Profile | null = null;
  availableProfiles: Profile[] = [];

  // UI States for menus and theme
  isUserMenuOpen = false;
  isProfileMenuOpen = false;
  isNavMenuOpen = false;
  isDarkMode = false;

  private destroy$ = new Subject<void>();

  ngOnInit() {
    // Listen to auth changes
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        this.currentUser = user;
        if (user) {
          const first = user.firstName?.charAt(0) || '';
          const last = user.lastName?.charAt(0) || '';
          this.userInitials = (first + last).toUpperCase() || user.email.charAt(0).toUpperCase();
        }
        this.cdr.markForCheck();
      });

    // Listen to available profiles list
    this.profileService.allProfiles$
      .pipe(takeUntil(this.destroy$))
      .subscribe(profiles => {
        this.availableProfiles = profiles;
        this.cdr.markForCheck();
      });

    // Listen to active profile changes
    this.profileService.currentProfile$
      .pipe(takeUntil(this.destroy$))
      .subscribe(profile => {
        this.activeProfile = profile;
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Toggles between light and dark mode by applying a CSS class to the body
  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark', this.isDarkMode);
  }

  // Allows the user to select a different profile, updating the active profile and closing the menu
  selectProfile(profile: Profile) {
    this.profileService.switchProfile(profile);
    this.isProfileMenuOpen = false;
  }

  // Toggles the profile menu and ensures others are closed
  toggleProfileMenu(event: Event) {
    event.stopPropagation();
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
    this.closeOtherMenus('profile');
  }

  // Toggles the user menu and ensures others are closed
  toggleUserMenu(event: Event) {
    event.stopPropagation();
    this.isUserMenuOpen = !this.isUserMenuOpen;
    this.closeOtherMenus('user');
  }

  // Toggles the navigation menu and ensures others are closed
  toggleNavMenu(event: Event) {
    event.stopPropagation();
    this.isNavMenuOpen = !this.isNavMenuOpen;
    this.closeOtherMenus('nav');
  }

  // Closes menus other than the specified one to improve user experience
  private closeOtherMenus(except: string) {
    if (except !== 'profile') this.isProfileMenuOpen = false;
    if (except !== 'user') this.isUserMenuOpen = false;
    if (except !== 'nav') this.isNavMenuOpen = false;

    // As we are mutating variables that affect the UI state, we need to signal Angular
    this.cdr.markForCheck();
  }

  // Closes all open menus when the user clicks outside of any menu
  @HostListener('document:click')
  onDocumentClick() {
    if (this.isProfileMenuOpen || this.isUserMenuOpen || this.isNavMenuOpen) {
      this.isProfileMenuOpen = false;
      this.isUserMenuOpen = false;
      this.isNavMenuOpen = false;
      this.cdr.markForCheck(); // Signal UI update for menu closures
    }
  }

  // Logs the user out, clearing the session and redirecting to the login page
  async logout() {
    await this.authService.signOut();
    this.router.navigate(['/auth/login']);
  }
}
