import { Routes } from '@angular/router';
import { LoginComponent } from './components/login.component';
import { DashboardLayoutComponent } from './components/dashboard-layout.component';
import { DashboardComponent } from './components/dashboard.component';
import { UserManagementComponent } from './components/user-management.component';
import { AuthGuard } from './guards/auth.guard';
import { ProfileComponent } from './components/profile.component';
// IMPORTATION DU NOUVEAU COMPOSANT
import { HierarchyComponent } from './components/hierarchy.component';

export const routes: Routes = [
  // Racine redirige vers login
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Login (Page sans sidebar)
  { path: 'login', component: LoginComponent },

  // Dashboard et ses enfants (Toutes ces pages auront la Sidebar)
  {
    path: '',
    component: DashboardLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'users', component: UserManagementComponent },
      { path: 'profile', component: ProfileComponent },
      // --- AJOUT DE LA ROUTE HIERARCHIE ICI ---
      { path: 'hierarchy', component: HierarchyComponent }, 
    ]
  },

  // Toutes autres routes → login
  { path: '**', redirectTo: 'login' }
];