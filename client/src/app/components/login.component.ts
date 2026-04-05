import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = signal('');
  password = signal('');
  isLoading = signal(false);
  errorMessage = signal('');
  isRegisterMode = signal(false);
  registerName = signal('');

  login() {
    if (!this.email() || !this.password()) {
      this.errorMessage.set('Veuillez remplir tous les champs');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.login(this.email(), this.password()).subscribe({
      next: () => {
        this.isLoading.set(false);
        // 🔹 Utilisation de replaceUrl pour empêcher le retour arrière vers login
        this.router.navigate(['/dashboard'], { replaceUrl: true });
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          error.error?.message || 'Identifiants invalides'
        );
      }
    });
  }

  register() {
    if (!this.email() || !this.password() || !this.registerName()) {
      this.errorMessage.set('Veuillez remplir tous les champs');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.register(this.email(), this.registerName(), this.password()).subscribe({
      next: () => {
        this.isLoading.set(false);
        // 🔹 Même chose pour l'inscription
        this.router.navigate(['/dashboard'], { replaceUrl: true });
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          error.error?.message || 'Erreur lors de l\'inscription'
        );
      }
    });
  }

  toggleMode() {
    this.isRegisterMode.update(val => !val);
    this.errorMessage.set('');
    this.email.set('');
    this.password.set('');
    this.registerName.set('');
  }
}