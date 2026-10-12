import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';

// types 
export interface AdminProfil {
  admin_matricule: string;
  admin_nom: string;
  admin_prenom: string;
  admin_fonction: string;
}

export interface AdminKpis {
  en_attente: number;
  nbr_utilisateurs: number;
  ce_mois: number;
}

export interface VentilationItem {
  annee: number;
  jours: number;
}

export interface DemandeAdmin {
  demande_id: number;
  demande_type: string;
  demande_motif: string | null;
  demande_date_debut: string;
  demande_date_fin: string | null;
  demande_date_creation: string;
  demande_date_decision: string | null;
  demande_status: string;
  demande_lieu_jouissance: string | null;
  demande_motif_refus: string | null;
  utilisateur_matricule: string;
  admin_matricule: string | null;
  utilisateur_nom: string;
  utilisateur_prenom: string;
  utilisateur_service: string;
  admin_nom: string | null;
  admin_prenom: string | null;
  admin_fonction: string | null;
  nb_jours: number;
  ventilation: VentilationItem[];
  titre_annees: string;
}



@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost/api';

  profil    = signal<AdminProfil | null>(null);
  kpis      = signal<AdminKpis | null>(null);
  demandes  = signal<DemandeAdmin[]>([]);
  isLoading = signal(false);

//   filtre
 demandesEnAttente = computed(() =>
    this.demandes().filter(d => d.demande_status === 'en_attente')
  );

   demandesAcceptees = computed(() =>
    this.demandes().filter(d => d.demande_status === 'acceptee')
  );

  demandesRefusees = computed(() =>
    this.demandes().filter(d => d.demande_status === 'refusee')
  );

//   chargement initial (profil , kpis , demandes )
chargerTout() {
    this.isLoading.set(true);

    return forkJoin({
      home:     this.http.get<any>(`${this.apiUrl}/admin_home.php`),
      demandes: this.http.get<any>(`${this.apiUrl}/admin_demandes.php`)
    }).subscribe({
      next: ({ home, demandes }) => {
        if (home.success) {
          this.profil.set(home.profil);
          this.kpis.set(home.kpis);
        }
        if (demandes.success) {
          this.demandes.set(demandes.demandes);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement admin:', err);
        this.isLoading.set(false);
      }
    });
  }

  // Rafraîchir uniquement les demandes
  chargerDemandes() {
    return this.http.get<any>(`${this.apiUrl}/admin_demandes.php`).subscribe({
      next: (res) => {
        if (res.success) this.demandes.set(res.demandes);
      },
      error: (err) => console.error('Erreur admin_demandes.php:', err)
    });
  }

  // accepter une demande
   accepter(demandeId: number) {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/demande_valider.php`,
      {
        demande_id: demandeId,
        decision: 'acceptee'
      }
    );
  }

  // Refuser une demande
  refuser(demandeId: number, motifRefus: string) {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/demande_valider.php`,
      {
        demande_id: demandeId,
        decision: 'refusee',
        motif_refus: motifRefus
      }
    );
  }
}