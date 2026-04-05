import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AssetStateService {
  selectedAsset = signal<any>(null);

  setAsset(asset: any) {
    this.selectedAsset.set(asset);
  }
}