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
  availablePermissions = signal<any[]>([]);
  
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
    role: 'AGENT',
    permissionIds: [] as number[]
  });
  
  userToDelete = signal<any>(null);

  ngOnInit() {
    this.loadUsers();
    this.loadPermissions();
  }

  loadUsers() {
    const token = this.authService.getToken();
    this.http.get<any[]>('http://localhost:3000/users', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe(res => this.users.set(res));
  }

  loadPermissions() {
    const token = this.authService.getToken();
    this.http.get<any[]>('http://localhost:3000/users/permissions/all', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (res) => {
        console.log('Permissions loaded:', res);
        this.availablePermissions.set(res);
      },
      error: (err) => {
        console.error('Error loading permissions:', err);
        // Set default permissions if API fails
        this.availablePermissions.set([
          { id: 1, code: 'VIEW_DASHBOARD', name: 'Voir le tableau de bord', description: 'Accès au tableau de bord principal' },
          { id: 2, code: 'VIEW_CONSUMPTION', name: 'Voir la consommation', description: 'Voir les données temps réel et historiques' },
          { id: 3, code: 'VIEW_ALERTS', name: 'Voir les alertes', description: 'Voir les alertes et anomalies' },
          { id: 4, code: 'VIEW_REPORTS', name: 'Voir les rapports', description: 'Accès aux rapports mensuels/annuels' },
          { id: 5, code: 'VIEW_INVOICES', name: 'Voir les factures', description: 'Accès aux factures et facturation' },
          { id: 6, code: 'MANAGE_THRESHOLDS', name: 'Gérer les seuils', description: 'Modifier les seuils d\'alerte' },
          { id: 7, code: 'MANAGE_ASSETS', name: 'Gérer les équipements', description: 'Créer/modifier/supprimer les équipements' },
          { id: 8, code: 'MANAGE_USERS', name: 'Gérer les utilisateurs', description: 'Créer/modifier/supprimer les utilisateurs' },
          { id: 9, code: 'EXPORT_DATA', name: 'Exporter les données', description: 'Exporter les données en CSV/PDF' },
          { id: 10, code: 'VIEW_BILLING', name: 'Voir la facturation', description: 'Accès aux détails de facturation' }
        ]);
      }
    });
  }

  // --- ACTIONS DES BOUTONS ---

  openAdd() {
    this.isEditMode.set(false);
    this.userForm.set({ id: null, username: '', email: '', password: '', role: 'AGENT', permissionIds: [] });
    this.showUserModal.set(true);
  }

  openEdit(user: any) {
    this.isEditMode.set(true);
    const token = this.authService.getToken();
    // Charger les permissions de l'utilisateur
    this.http.get<any[]>(`http://localhost:3000/users/${user.id}/permissions`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe(perms => {
      const permIds = perms.map(p => p.id);
      this.userForm.set({ ...user, password: '', permissionIds: permIds });
      this.showUserModal.set(true);
    });
  }

  askDelete(user: any) {
    this.userToDelete.set(user);
    this.showDeleteModal.set(true);
  }

  togglePermission(permissionId: number) {
    const form = this.userForm();
    const perms = form.permissionIds;
    if (perms.includes(permissionId)) {
      form.permissionIds = perms.filter(id => id !== permissionId);
    } else {
      form.permissionIds = [...perms, permissionId];
    }
    this.userForm.set({ ...form });
  }

  saveUser() {
    const data = this.userForm();
    const token = this.authService.getToken();
    const headers = { Authorization: `Bearer ${token}` };
    const payload: any = { ...data, permissions: data.permissionIds };
    delete payload.permissionIds;

    if (this.isEditMode()) {
      this.http.patch(`http://localhost:3000/users/${data.id}`, payload, { headers })
        .subscribe(() => { this.loadUsers(); this.showUserModal.set(false); });
    } else {
      this.http.post('http://localhost:3000/users', payload, { headers })
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

  isPermissionSelected(permissionId: number): boolean {
    return this.userForm().permissionIds.includes(permissionId);
  }

  getPermissionsByRole(role: string): any[] {
    const perms = this.availablePermissions();
    console.log('Getting permissions for role:', role, 'Available:', perms);
    
    if (!perms || perms.length === 0) return [];
    
    const normalizedRole = role?.toUpperCase().replace(/\s+/g, '_');
    
    if (normalizedRole === 'AGENT') {
      return perms.filter(p => ['VIEW_DASHBOARD', 'VIEW_CONSUMPTION', 'VIEW_ALERTS'].includes(p.code));
    } else if (['RESPONSABLE_ENERGIE', 'RESP_ENERGIE'].includes(normalizedRole)) {
      return perms.filter(p => ['VIEW_DASHBOARD', 'VIEW_CONSUMPTION', 'VIEW_REPORTS', 'VIEW_INVOICES', 'MANAGE_THRESHOLDS', 'VIEW_ALERTS', 'EXPORT_DATA'].includes(p.code));
    } else if (normalizedRole === 'ADMIN') {
      return perms; // ADMIN a accès à tout
    }
    return [];
  }
}
