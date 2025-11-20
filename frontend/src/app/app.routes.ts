import { Routes } from '@angular/router';
import { ProductEntryComponent } from './components/product-entry/product-entry.component';
import { UserRegistrationComponent } from './components/user-registration/user-registration.component';
import { authGuard } from './guards/auth.guards';
import { DocumentManagementComponent } from './components/document-management/document-management.component';

/**
 * Definição das rotas principais da aplicação.
 *
 * Cada rota mapeia um path para um componente específico
 * e, quando necessário, utiliza o `authGuard` para proteger
 * o acesso (exigindo autenticação).
 */
export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: 'product-entry',
    component: ProductEntryComponent,
    canActivate: [authGuard],
  },
  {
    path: 'user-registration',
    component: UserRegistrationComponent,
    canActivate: [authGuard],
  },
  {
    path: 'documents',
    component: DocumentManagementComponent,
    canActivate: [authGuard],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
];
