import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface SoldeAnnee {
  solde_annuel_annee: number;
  solde_annuel_valeur: number;
}

export interface Ventilation {
  annee: number;
  jours: number;
}

@Injectable({ providedIn: 'root' })
export class SoldeService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost/api';

  soldes = signal<SoldeAnnee[]>([]);

  chargerSoldes() {
    return this.http.get<{ success: boolean; soldes: SoldeAnnee[] }>(
      `${this.apiUrl}/solde.php`
    ).subscribe({
      next: (res) => {
        if (res.success) this.soldes.set(res.soldes);
      },
      error: (err) => console.error('Erreur solde.php:', err)
    });
  }

  totalDisponible(): number {
    return this.soldes().reduce((sum, s) => sum + Number(s.solde_annuel_valeur), 0);
  }

  ventiler(nbJours: number): Ventilation[] | null {
    const dispo = this.soldes();

    if (this.totalDisponible() < nbJours) return null;

    let reste = nbJours;
    const result: Ventilation[] = [];

    for (const s of dispo) {
      if (reste <= 0) break;

      const valeur = Number(s.solde_annuel_valeur);
      if (valeur <= 0) continue;

      const deduit = Math.min(reste, valeur);
      reste -= deduit;
      result.push({ annee: s.solde_annuel_annee, jours: deduit });
    }

    return result;
  }
}