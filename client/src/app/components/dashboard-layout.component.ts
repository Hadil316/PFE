import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './sidebar.component';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, CommonModule],
  template: `
    <div class="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      <app-sidebar class="h-full z-20 shrink-0"></app-sidebar>
      <div class="flex-1 flex flex-col h-screen overflow-hidden">
        <header class="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-10 shrink-0 z-10">
          <div class="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
            <span>DASHBOARD</span>
            <svg class="w-3 h-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"></path></svg>
            <span class="text-slate-900 font-black">OVERVIEW</span>
          </div>
          <div (click)="goTo('users')" class="hidden md:flex items-center bg-slate-50 rounded-2xl px-5 py-2.5 w-96 border border-slate-100 cursor-pointer group transition-all hover:bg-slate-100">
            <svg class="w-4 h-4 text-slate-400 group-hover:text-blue-500 mr-3 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input type="text" readonly placeholder="Rechercher un utilisateur..." class="bg-transparent border-none outline-none text-[13px] w-full text-slate-600 cursor-pointer" />
          </div>
          <div class="flex items-center gap-6" *ngIf="authService.currentUser$ | async as user">
            <button (click)="goTo('alerts')" class="relative p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
              <span class="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
            </button>
            <div class="h-8 w-[1px] bg-slate-200"></div>
            <div (click)="goTo('profile')" class="flex items-center gap-3 cursor-pointer group">
              <div class="text-right hidden sm:block">
                <p class="text-sm font-black text-cyan-400 leading-none uppercase">{{ user.username }}</p>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{{ user.role }}</p>
              </div>
              
              <!-- AVATAR HEADER : BLEU CIEL TRANSPARENT -->
              <div class="w-10 h-10 rounded-full bg-blue-50/50 border-2 border-blue-100 text-blue-500 flex items-center justify-center transition-all group-hover:border-blue-400 group-hover:scale-105 shadow-sm">
                 <span class="text-sm font-black">{{ (user.username || 'A').charAt(0).toUpperCase() }}</span>
              </div>
            </div>
          </div>
        </header>
        <main class="flex-1 overflow-y-auto bg-white relative">
          <div class="max-w-[1600px] mx-auto"><router-outlet></router-outlet></div>
        </main>
      </div>
    </div>
  `
})
export class DashboardLayoutComponent {
  public authService = inject(AuthService);
  private router = inject(Router);
  goTo(path: string) { this.router.navigate([`/${path}`]); }
}