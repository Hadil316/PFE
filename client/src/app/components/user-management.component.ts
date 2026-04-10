import { Component, signal, OnInit, inject } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './user-management.component.html',
})
export class UserManagementComponent implements OnInit {
  private http = inject(HttpClient);

  users = signal<any[]>([]);
  showModal = false;
  showDeleteModal = false;
  isEditMode = false;
  passwordVisible = false;
  userToDeleteId: number | null = null;
  visiblePasswords: { [key: number]: boolean } = {};
  userForm = { id: null, username: '', email: '', password: '', role: 'UTILISATEUR' };

  ngOnInit() {
    this.fetchUsers();
  }

  fetchUsers() {
    this.http.get<any[]>('http://localhost:3000/users').subscribe({
      next: (res) => this.users.set(res),
      error: (err) => console.error('Erreur lors de la récupération des utilisateurs', err),
    });
  }

  togglePassword(id: number) {
    this.visiblePasswords[id] = !this.visiblePasswords[id];
  }

  openAddModal() {
    this.isEditMode = false;
    this.userForm = { id: null, username: '', email: '', password: '', role: 'UTILISATEUR' };
    this.showModal = true;
  }

  openEditModal(user: any) {
    this.isEditMode = true;
    this.userForm = { ...user };
    this.showModal = true;
  }

  saveUser() {
    if (this.isEditMode) {
      this.http.patch(`http://localhost:3000/users/${this.userForm.id}`, this.userForm)
        .subscribe(() => { this.fetchUsers(); this.showModal = false; });
    } else {
      const { id, ...data } = this.userForm;
      this.http.post('http://localhost:3000/users', data)
        .subscribe(() => { this.fetchUsers(); this.showModal = false; });
    }
  }

  askDelete(id: number) {
    this.userToDeleteId = id;
    this.showDeleteModal = true;
  }

  confirmDelete() {
    if (this.userToDeleteId) {
      this.http.delete(`http://localhost:3000/users/${this.userToDeleteId}`)
        .subscribe(() => { this.fetchUsers(); this.showDeleteModal = false; });
    }
  }

  // CORRECTION : Fonction pour afficher le libellé du rôle correctement
  getRoleLabel(role: string): string {
    // Convertir en minuscule pour la comparaison (insensible à la casse)
    const roleLower = (role || '').toLowerCase();
    
    switch(roleLower) {
      case 'admin':
        return 'Admin';
      case 'responsable_energie':
        return 'Resp. Énergie';
      case 'utilisateur':
        return 'Agent';
      default:
        return role || 'Agent';
    }
  }

  // CORRECTION : Fonction pour obtenir la classe CSS du rôle
  getRoleClass(role: string): string {
    const roleLower = (role || '').toLowerCase();
    
    switch(roleLower) {
      case 'admin':
        return 'bg-purple-600';
      case 'responsable_energie':
        return 'bg-teal-600';
      case 'utilisateur':
        return 'bg-blue-600';
      default:
        return 'bg-slate-600';
    }
  }

  // CORRECTION : Fonction pour obtenir la classe du badge
  getBadgeClass(role: string): string {
    const roleLower = (role || '').toLowerCase();
    
    switch(roleLower) {
      case 'admin':
        return 'bg-purple-100 text-purple-700';
      case 'responsable_energie':
        return 'bg-teal-100 text-teal-700';
      case 'utilisateur':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  }
}