import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './sidebar.component';
import { AuthService } from '../services/auth.service';
import { AssetStateService } from '../services/asset-state.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, CommonModule],
  template: `
    <div class="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      
      <!-- Sidebar -->
      <app-sidebar class="h-full z-20"></app-sidebar>
      
      <div class="flex-1 flex flex-col h-screen overflow-hidden">
        
        <!-- Navbar Top -->
        <header class="h-[88px] bg-white border-b border-slate-100 flex items-center justify-between px-8 shrink-0">
          
          <!-- Breadcrumb -->
          <div class="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span>DASHBOARD</span>
            <svg class="w-3 h-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
            <span class="text-slate-800">OVERVIEW</span>
          </div>

          <!-- Search Bar -->
          <div class="hidden md:flex items-center bg-slate-50 rounded-2xl px-4 py-2.5 w-96 border border-slate-100">
            <svg class="w-4 h-4 text-slate-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <input type="text" placeholder="Rechercher..." 
              class="bg-transparent border-none outline-none text-sm w-full text-slate-600 placeholder-slate-400" />
          </div>

          <!-- Actions & User Profile -->
          <div class="flex items-center gap-6" *ngIf="authService.currentUser$ | async as user">
            <!-- Notification -->
            <button class="relative p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
              </svg>
              <span class="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
            </button>

            <div class="h-8 w-[1px] bg-slate-200"></div>

            <!-- Profile Info -->
            <div (click)="navigateToProfile()" class="flex items-center gap-4 cursor-pointer group">
              <div class="text-right">
                <!-- Nom dynamique -->
                <p class="text-sm font-bold text-slate-900 leading-tight">{{ user.username || 'Agent' }}</p>
                <!-- Rôle dynamique affiché exactement comme dans la base -->
                <p class="text-[10px] font-bold text-slate-400 tracking-wider">{{ user.role }}</p>
              </div>
              <div class="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center transition-all group-hover:bg-slate-200">
                 <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                   d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                 </svg>
              </div>
            </div>

            <!-- Déconnexion cachée (gérée par sidebar) -->
            <button (click)="openLogoutModal()" class="hidden"></button>
          </div>
        </header>

        <!-- Main Content -->
        <main class="flex-1 overflow-y-auto w-full max-w-[1600px] mx-auto">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>

    <!-- Modal Confirmation Déconnexion -->
    <div *ngIf="showLogoutModal" class="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm">
      <div class="bg-white rounded-3xl w-96 p-8 shadow-2xl text-center">
        <div class="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-red-100 mb-6">
          <svg class="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
        </div>
        <h3 class="text-xl font-bold text-slate-900 mb-2">Déconnexion</h3>
        <p class="text-sm text-slate-500 mb-8">Êtes-vous sûr de vouloir vous déconnecter de votre session ?</p>
        <div class="flex gap-3">
          <button (click)="closeLogoutModal()" class="flex-1 px-4 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition">Annuler</button>
          <button (click)="confirmLogout()" class="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 shadow-lg shadow-red-500/30 transition">Déconnecter</button>
        </div>
      </div>
    </div>
  `
})
export class DashboardLayoutComponent {
  public authService = inject(AuthService);
  public assetState = inject(AssetStateService);
  private router = inject(Router);

  showLogoutModal = false;

  openLogoutModal() {
    this.showLogoutModal = true;
  }
  closeLogoutModal() {
    this.showLogoutModal = false;
  }
  confirmLogout() {
    this.showLogoutModal = false;
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  navigateToProfile() {
    this.router.navigate(['/profile']);
  }
}