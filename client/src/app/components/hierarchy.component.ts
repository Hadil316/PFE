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
  showAssetModal = signal(false);
  isEditAssetMode = signal(false);
  showDeleteAssetModal = signal(false);
  assetToDeleteName = signal('');
  
  // MODIFICATION : Ajout de webSocketLink ici
  assetForm = signal({ 
    id: null as number | null, 
    name: '', 
    type: 'EQUIPEMENT', 
    parentId: null as number | null,
    webSocketLink: '' 
  });
  
  assetToDeleteId: number | null = null;

  ngOnInit() {
    this.loadHierarchy();
  }

  loadHierarchy() {
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    this.http.get<any[]>('http://localhost:3000/assets/tree', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: res => this.hierarchy.set(res),
      error: err => console.error('Erreur hiérarchie:', err)
    });
  }

  selectAsset(asset: any) {
    this.assetState.setAsset(asset);
    this.router.navigate(['/dashboard'], { queryParams: { id: asset.id } });
  }

  openAdd(parent: any, type: string) {
    this.isEditAssetMode.set(false);
    // On réinitialise tout, y compris le lien
    this.assetForm.set({ 
      id: null, 
      name: '', 
      type: type, 
      parentId: parent?.id || null, 
      webSocketLink: '' 
    });
    this.showAssetModal.set(true);
  }

  openEdit(asset: any) {
    this.isEditAssetMode.set(true);
    // On charge les données existantes, y compris le lien
    this.assetForm.set({ 
      id: asset.id, 
      name: asset.name, 
      type: asset.type, 
      parentId: asset.parentId,
      webSocketLink: asset.webSocketLink || '' 
    });
    this.showAssetModal.set(true);
  }

  saveAsset() {
    const form = this.assetForm();
    const token = localStorage.getItem('auth_token');
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
    const token = localStorage.getItem('auth_token');
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