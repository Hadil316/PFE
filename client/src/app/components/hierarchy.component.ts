import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AssetStateService } from '../services/asset-state.service';

@Component({
  selector: 'app-hierarchy',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hierarchy.component.html' 
})
export class HierarchyComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  public authService = inject(AuthService);
  public assetState = inject(AssetStateService);

  hierarchy = signal<any[]>([]);
  isLoading = signal(true);
  errorMessage = signal('');
  showAssetModal = signal(false);
  isEditAssetMode = signal(false);
  showDeleteAssetModal = signal(false);
  assetToDeleteName = signal('');
  
  assetForm = signal({ 
    id: null as number | null, 
    name: '', 
    type: 'EQUIPEMENT', 
    parentId: null as number | null,
    webSocketLink: '',
    maxCurrent: 80
  });
  
  assetToDeleteId: number | null = null;

  ngOnInit() {
    this.loadHierarchy();
  }

  loadHierarchy() {
    const token = this.authService.getToken();
    if (!token) {
      this.errorMessage.set('Non connecté - Veuillez vous reconnecter');
      this.isLoading.set(false);
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set('');
    console.log('Token:', token);
    this.http.get<any[]>('http://localhost:3000/assets/tree', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: res => {
        console.log('Hierarchy response:', res);
        this.hierarchy.set(res);
        this.isLoading.set(false);
      },
      error: err => {
        console.error('Erreur hiérarchie:', err);
        this.errorMessage.set('Erreur: ' + (err.status + ' - ' + (err.error?.message || err.message || 'Erreur inconnue')));
        this.isLoading.set(false);
      }
    });
  }

  selectAsset(asset: any) {
    this.assetState.setAsset(asset);
    this.router.navigate(['/dashboard'], { queryParams: { id: asset.id } });
  }

  // --- FONCTIONS POUR OUVRIR LES MODALS ---
  openAdd(parent: any, type: string) {
    this.isEditAssetMode.set(false);
    this.assetForm.set({ 
        id: null, name: '', type: type, 
        parentId: parent?.id || null, 
        webSocketLink: '', maxCurrent: 80 
    });
    this.showAssetModal.set(true);
  }

  openEdit(asset: any) {
    this.isEditAssetMode.set(true);
    this.assetForm.set({ 
      id: asset.id, name: asset.name, type: asset.type, 
      parentId: asset.parentId, 
      webSocketLink: asset.webSocketLink || '',
      maxCurrent: asset.maxCurrent || 80 
    });
    this.showAssetModal.set(true);
  }

  saveAsset() {
    const form = this.assetForm();
    const token = this.authService.getToken();
    const options = { headers: { Authorization: `Bearer ${token}` } };
    
    if (this.isEditAssetMode()) {
      this.http.patch(`http://localhost:3000/assets/${form.id}`, form, options).subscribe(() => {
        this.loadHierarchy();
        this.showAssetModal.set(false);
      });
    } else {
      this.http.post('http://localhost:3000/assets', form, options).subscribe(() => {
        this.loadHierarchy();
        this.showAssetModal.set(false);
      });
    }
  }

  askDelete(asset: any) {
    this.assetToDeleteId = asset.id;
    this.assetToDeleteName.set(asset.name);
    this.showDeleteAssetModal.set(true);
  }

  confirmDelete() {
    const token = this.authService.getToken();
    this.http.delete(`http://localhost:3000/assets/${this.assetToDeleteId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe(() => {
      this.loadHierarchy();
      this.showDeleteAssetModal.set(false);
    });
  }

  getAddButtonLabel(type: string): string {
    const labels: any = { 'SITE': 'un Site', 'TGBT': 'un TGBT', 'ARMOIRE': 'une Armoire', 'LIGNE': 'une Ligne', 'EQUIPEMENT': 'un Équipement' };
    return 'Ajouter ' + (labels[type] || 'un élément');
  }
}