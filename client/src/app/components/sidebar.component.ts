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
  showLogoutModal = false; // NOUVEAU : contrôle l'affichage du modal

  ngOnInit() {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
      if (e.url.includes('hierarchy')) this.activeButton.set('hierarchy');
      else if (e.url.includes('users')) this.activeButton.set('users');
      else this.activeButton.set('overview');
    });
  }

  navigateTo(route: string) {
    this.router.navigate([`/${route}`]);
  }

  // NOUVEAU : Afficher le modal de confirmation
  showLogoutConfirm() {
    this.showLogoutModal = true;
  }

  // NOUVEAU : Fermer le modal sans déconnecter
  closeLogoutConfirm() {
    this.showLogoutModal = false;
  }

  // MODIFIÉ : Ne plus appeler directement le logout, c'est le modal qui l'appelle après confirmation
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.showLogoutModal = false; // Fermer le modal après déconnexion
  }
}