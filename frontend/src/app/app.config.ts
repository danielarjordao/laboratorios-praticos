import { ApplicationConfig, provideBrowserGlobalErrorListeners, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
// Importação para suporte a localização (ex: formatação de datas e moedas)
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt-PT';

import { routes } from './app.routes';

// Registra a localização portuguesa para formatação de datas e moedas
registerLocaleData(localePt);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // Configura o HttpClient para toda a aplicação, permitindo injeção em serviços e componentes
    provideHttpClient(),
    // Configura o idioma base de formatação para português de Portugal
    // (Isso pode ser sobrescrito em componentes específicos se necessário)
    { provide: LOCALE_ID, useValue: 'pt-PT' }
  ]
};
