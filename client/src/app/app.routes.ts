import { Routes } from '@angular/router';
import { LoginComponent } from './components/login.component';
import { DashboardLayoutComponent } from './components/dashboard-layout.component';
import { DashboardComponent } from './components/dashboard.component';
import { UserManagementComponent } from './components/user-management.component';
import { HierarchyComponent } from './components/hierarchy.component';
import { AlertsComponent } from './components/alerts.component'; 
import { ReportsComponent } from './components/reports.component';
import { BillingComponent } from './components/billing.component'; // <--- IMPORT
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: '', component: DashboardLayoutComponent, canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'hierarchy', component: HierarchyComponent },
      { path: 'users', component: UserManagementComponent },
      { path: 'alerts', component: AlertsComponent },
      { path: 'reports', component: ReportsComponent },
      { path: 'billing', component: BillingComponent }, // <--- ROUTE
    ]
  },
  { path: '**', redirectTo: 'login' }
];