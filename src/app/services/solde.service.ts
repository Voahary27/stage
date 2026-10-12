import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface SoldeAnnee {
  annee_solde: number;
  valeur_solde: number;
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

  // Charge les soldes disponibles depuis le backend 
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

  //Total disponible 
  totalDisponible(): number {
    return this.soldes().reduce((sum, s) => sum + Number(s.valeur_solde), 0);
  }

  
   // Calcule la ventilation FIFO pour N jours.
  // Retourne null si le solde total est insuffisant.
   
  ventiler(nbJours: number): Ventilation[] | null {
    const dispo = this.soldes();

    if (this.totalDisponible() < nbJours) return null;

    let reste = nbJours;
    const result: Ventilation[] = [];

    for (const s of dispo) {
      if (reste <= 0) break;
      const deduit = Math.min(reste, Number(s.valeur_solde));
      reste -= deduit;
      result.push({ annee: s.annee_solde, jours: deduit });
    }

    return result;
  }
}