import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.component.html'
})
export class UserManagementComponent implements OnInit {
  private http = inject(HttpClient);
  public authService = inject(AuthService);

  users = signal<any[]>([]);
  
  // --- Signaux pour les Fenêtres (Modals) ---
  showUserModal = signal(false);
  showDeleteModal = signal(false);
  isEditMode = signal(false);
  
  // Formulaire
  userForm = signal({ 
    id: null as number | null, 
    username: '', 
    email: '', 
    password: '', 
    role: 'AGENT' 
  });
  
  userToDelete = signal<any>(null);

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    const token = this.authService.getToken();
    this.http.get<any[]>('http://localhost:3000/users', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe(res => this.users.set(res));
  }

  // --- ACTIONS DES BOUTONS ---

  openAdd() {
    this.isEditMode.set(false);
    this.userForm.set({ id: null, username: '', email: '', password: '', role: 'AGENT' });
    this.showUserModal.set(true); // Ouvre la fenêtre
  }

  openEdit(user: any) {
    this.isEditMode.set(true);
    this.userForm.set({ ...user, password: '' });
    this.showUserModal.set(true); // Ouvre la fenêtre
  }

  askDelete(user: any) {
    this.userToDelete.set(user);
    this.showDeleteModal.set(true); // Ouvre la fenêtre
  }

  saveUser() {
    const data = this.userForm();
    const token = this.authService.getToken();
    const headers = { Authorization: `Bearer ${token}` };

    if (this.isEditMode()) {
      this.http.patch(`http://localhost:3000/users/${data.id}`, data, { headers })
        .subscribe(() => { this.loadUsers(); this.showUserModal.set(false); });
    } else {
      this.http.post('http://localhost:3000/users', data, { headers })
        .subscribe(() => { this.loadUsers(); this.showUserModal.set(false); });
    }
  }

  confirmDelete() {
    const user = this.userToDelete();
    if (!user) return;
    const token = this.authService.getToken();
    this.http.delete(`http://localhost:3000/users/${user.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe(() => {
      this.loadUsers();
      this.showDeleteModal.set(false);
    });
  }
}