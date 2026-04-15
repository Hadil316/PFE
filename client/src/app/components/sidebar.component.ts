import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent implements OnInit {
  private router = inject(Router);
  public authService = inject(AuthService);
  
  activeButton = signal('overview');
  
  // --- SIGNAL POUR LA MODAL DE DÉCONNEXION ---
  showLogoutModal = signal(false);

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.url;
      if (url.includes('hierarchy')) this.activeButton.set('hierarchy');
      else if (url.includes('users')) this.activeButton.set('users');
      else if (url.includes('alerts')) this.activeButton.set('alerts');
      else if (url.includes('reports')) this.activeButton.set('reports');
      else if (url.includes('billing')) this.activeButton.set('billing');
      else this.activeButton.set('overview');
    });
  }

  navigateTo(route: string) {
    this.router.navigate([`/${route}`]);
  }

  // --- MÉTHODES DE DÉCONNEXION APPELÉES PAR LE HTML ---
  
  askLogout() {
    this.showLogoutModal.set(true);
  }

  cancelLogout() {
    this.showLogoutModal.set(false);
  }

  confirmLogout() {
    this.showLogoutModal.set(false);
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  logout() {
    // Gardé par sécurité si appelé ailleurs
    this.askLogout();
  }
}