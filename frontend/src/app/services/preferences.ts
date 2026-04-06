import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type AppTheme = 'light' | 'dark' | 'system';

export interface RuntimePreferences {
  theme: AppTheme;
  currency: string;
  locale: string;
}

@Injectable({ providedIn: 'root' })
export class PreferencesService {
  private readonly darkThemeClass = 'dark';
  private readonly storageKey = 'app.preferences';

  private readonly preferencesSubject = new BehaviorSubject<RuntimePreferences>(this.loadInitialPreferences());
  readonly preferences$ = this.preferencesSubject.asObservable();

  // Retorna as preferências atuais, permitindo que outros componentes acessem as configurações de tema, moeda e localidade para formatação e exibição de dados.
  get current(): RuntimePreferences {
    return this.preferencesSubject.value;
  }

  // Atualiza o tema, aplicando as mudanças imediatamente e emitindo o novo estado para os assinantes. Também dispara um evento global para notificar outros componentes sobre a mudança de tema.
  setTheme(theme: AppTheme): void {
    const next = { ...this.current, theme };
    this.applyAndEmit(next);
  }

  // Atualiza a moeda, aplicando as mudanças imediatamente e emitindo o novo estado para os assinantes. A mudança de moeda também pode afetar a localidade usada para formatação, então o método garante que ambos sejam atualizados de forma consistente.
  setCurrency(currency: string): void {
    const locale = this.mapLocaleFromCurrency(currency);
    const next = { ...this.current, currency, locale };
    this.applyAndEmit(next);
  }

  // Aplica as preferências a partir de um objeto de configurações, garantindo que o tema, moeda e localidade sejam atualizados de forma consistente. Este método é útil para aplicar um conjunto completo de preferências, como ao carregar as configurações do usuário a partir do backend.
  applyFromSettings(theme: AppTheme, currency: string, language?: string): void {
    const locale = language || this.mapLocaleFromCurrency(currency);
    const next = { theme, currency, locale };
    this.applyAndEmit(next);
  }

  // Formata um valor numérico como moeda, usando a localidade e moeda atuais. Este método é utilizado por componentes como Accounts para exibir valores monetários de forma consistente com as preferências do usuário.
  formatCurrency(value: number | null | undefined): string {
    const amount = value ?? 0;
    return new Intl.NumberFormat(this.current.locale, {
      style: 'currency',
      currency: this.current.currency,
    }).format(amount);
  }

  // Aplica as mudanças de preferências, emitindo o novo estado para os assinantes e persistindo as configurações no localStorage. Se o tema tiver sido alterado, também dispara um evento global para notificar outros componentes sobre a mudança.
  private applyAndEmit(next: RuntimePreferences): void {
    const current = this.current;
    const isSame = current.theme === next.theme
      && current.currency === next.currency
      && current.locale === next.locale;

    if (isSame) {
      return;
    }

    const themeChanged = current.theme !== next.theme;

    this.applyTheme(next.theme);
    this.applyLocale(next.locale);
    this.preferencesSubject.next(next);
    this.persist(next);

    if (themeChanged) {
      document.dispatchEvent(new CustomEvent('app-theme-changed', { detail: { source: 'preferences', theme: next.theme } }));
    }
  }

  private applyTheme(theme: AppTheme): void {
    const shouldUseDark = theme === 'dark'
      || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    document.body.classList.toggle(this.darkThemeClass, shouldUseDark);
  }

  private applyLocale(locale: string): void {
    document.documentElement.lang = locale;
  }

  private mapLocaleFromCurrency(currency: string): string {
    if (currency === 'BRL') return 'pt-BR';
    if (currency === 'USD') return 'en-US';
    if (currency === 'GBP') return 'en-GB';
    return 'pt-PT';
  }

  private persist(preferences: RuntimePreferences): void {
    window.localStorage.setItem(this.storageKey, JSON.stringify(preferences));
  }

  private loadInitialPreferences(): RuntimePreferences {
    const defaults: RuntimePreferences = {
      theme: document.body.classList.contains(this.darkThemeClass) ? 'dark' : 'light',
      currency: 'EUR',
      locale: 'pt-PT',
    };

    try {
      const storedRaw = window.localStorage.getItem(this.storageKey);
      if (!storedRaw) {
        this.applyTheme(defaults.theme);
        this.applyLocale(defaults.locale);
        return defaults;
      }

      const stored = JSON.parse(storedRaw) as Partial<RuntimePreferences>;
      const parsed: RuntimePreferences = {
        theme: stored.theme === 'dark' || stored.theme === 'system' ? stored.theme : 'light',
        currency: typeof stored.currency === 'string' ? stored.currency : 'EUR',
        locale: typeof stored.locale === 'string' ? stored.locale : 'pt-PT',
      };

      this.applyTheme(parsed.theme);
      this.applyLocale(parsed.locale);
      return parsed;
    } catch {
      this.applyTheme(defaults.theme);
      this.applyLocale(defaults.locale);
      return defaults;
    }
  }
}
