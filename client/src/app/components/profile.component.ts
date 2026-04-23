import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  public authService = inject(AuthService);
  
  userProfile = signal<any>({ username: 'Chargement...', email: '', role: '' });
  passwords = signal({ current: '', new: '', confirm: '' });

  // --- Signaux pour la Modal de Succès ---
  showSuccessModal = signal(false);
  successMessage = signal('');
  modalTheme = signal<'green' | 'purple'>('green'); // <--- Gère la couleur dynamique

  ngOnInit() {
    this.authService.currentUser$.pipe(take(1)).subscribe(user => {
      if (user) {
        this.userProfile.set({
          username: user.username || 'Utilisateur',
          email: user.email || '',
          role: user.role || 'ADMIN'
        });
      }
    });
  }

  saveProfile() {
    // Logique métier : Sauvegarde
    this.modalTheme.set('green'); // <--- Thème Vert
    this.successMessage.set('Vos informations ont été mises à jour avec succès !');
    this.showSuccessModal.set(true);
  }

  updatePassword() {
    if (this.passwords().new !== this.passwords().confirm) {
      return;
    }
    // Logique métier : Modification mot de passe
    this.modalTheme.set('purple'); // <--- Thème Violet
    this.successMessage.set('Mot de passe modifié avec succès !');
    this.showSuccessModal.set(true);
    this.passwords.set({ current: '', new: '', confirm: '' });
  }

  closeSuccess() {
    this.showSuccessModal.set(false);
  }
}