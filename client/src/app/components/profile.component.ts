import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {

  private http = inject(HttpClient);
  private authService = inject(AuthService);

  currentUser: User = {
    id: 0,
    username: '',
    email: '',
    role: ''
  };

  newPassword = '';
  confirmPassword = '';
  isLoading = signal(false);
  isPasswordLoading = signal(false);
  successMessage = signal('');
  errorMessage = signal('');
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    const storedUser = localStorage.getItem('current_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.currentUser = {
          id: user.id || 0,
          username: user.username || '',
          email: user.email || '',
          role: user.role || 'UTILISATEUR',
          createdAt: user.createdAt || new Date().toISOString()
        };
      } catch (e) {
        console.error('Erreur lors du parsing', e);
      }
    }
  }

  updateProfile() {
    if (!this.currentUser.username.trim() || !this.currentUser.email.trim()) {
      this.errorMessage.set('Tous les champs sont requis');
      setTimeout(() => this.errorMessage.set(''), 3000);
      return;
    }

    this.isLoading.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    const token = this.authService.getToken();
    
    this.http.patch(
      `http://localhost:3000/users/${this.currentUser.id}`,
      {
        username: this.currentUser.username,
        email: this.currentUser.email
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    ).subscribe({
      next: (response: any) => {
        const updatedUser = {
          ...this.currentUser,
          username: this.currentUser.username,
          email: this.currentUser.email
        };
        localStorage.setItem('current_user', JSON.stringify(updatedUser));
        
        this.isLoading.set(false);
        this.successMessage.set('Profil mis à jour avec succès !');
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Erreur lors de la mise à jour');
        setTimeout(() => this.errorMessage.set(''), 3000);
      }
    });
  }

  changePassword() {
    if (!this.newPassword || this.newPassword.length < 6) {
      this.errorMessage.set('Le mot de passe doit contenir au moins 6 caractères');
      setTimeout(() => this.errorMessage.set(''), 3000);
      return;
    }
    
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage.set('Les mots de passe ne correspondent pas');
      setTimeout(() => this.errorMessage.set(''), 3000);
      return;
    }

    this.isPasswordLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const token = this.authService.getToken();
    
    this.http.patch(
      `http://localhost:3000/users/${this.currentUser.id}/password`,
      { password: this.newPassword },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    ).subscribe({
      next: () => {
        this.isPasswordLoading.set(false);
        this.successMessage.set('Mot de passe changé avec succès !');
        this.newPassword = '';
        this.confirmPassword = '';
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.isPasswordLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Erreur lors du changement');
        setTimeout(() => this.errorMessage.set(''), 3000);
      }
    });
  }

  getRoleLabel(role: string): string {
    if (!role) return 'Agent';
    switch(role) {
      case 'ADMIN':
        return 'Administrateur';
      case 'RESPONSABLE_ENERGIE':
        return 'Responsable Énergie';
      case 'UTILISATEUR':
        return 'Agent';
      default:
        return 'Agent';
    }
  }

  toggleNewPasswordVisibility() {
    this.showNewPassword.set(!this.showNewPassword());
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }
}