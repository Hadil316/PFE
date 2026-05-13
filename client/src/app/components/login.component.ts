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

  isLogin = true;
  email = '';
  password = '';
  registerName = '';
  
  // Variables manquantes ajoutées pour le HTML
  isLoading = false;
  errorMessage = '';

  toggleMode() {
    this.isLogin = !this.isLogin;
    this.errorMessage = '';
  }

  login() {
    this.isLoading = true;
    this.errorMessage = '';
    const email = this.email.trim().toLowerCase();
    const password = this.password.trim();

    this.authService.login(email, password).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Identifiants invalides';
      }
    });
  }

  handleRegister() {
    this.isLoading = true;
    this.authService.register(this.email, this.registerName, this.password).subscribe({
      next: () => {
        this.isLoading = false;
        alert('Compte créé !');
        this.isLogin = true;
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Erreur inscription';
      }
    });
  }
}
