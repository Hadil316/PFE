import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  isLogin = signal(true);
  email = signal('');
  password = signal('');
  registerName = signal('');
  
  // Variables manquantes ajoutées pour le HTML
  isLoading = signal(false);
  errorMessage = signal('');

  toggleMode() { 
    this.isLogin.set(!this.isLogin()); 
    this.errorMessage.set('');
  }

  login() {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.authService.login(this.email(), this.password()).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err: any) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Identifiants invalides');
      }
    });
  }

  handleRegister() {
    this.isLoading.set(true);
    this.authService.register(this.email(), this.registerName(), this.password()).subscribe({
      next: () => {
        this.isLoading.set(false);
        alert('Compte créé !');
        this.isLogin.set(true);
      },
      error: (err: any) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Erreur inscription');
      }
    });
  }
}