import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export interface AdminProfil {
  utilisateur_matricule: string;
  utilisateur_nom: string;
  utilisateur_prenom: string;
  utilisateur_fonction: string;
  utilisateur_role: string;
  utilisateur_service: number;
  service_nom: string | null;
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
  demande_niveau_validation: number;
  demande_lieu_jouissance: string | null;
  demande_motif_refus: string | null;
  demande_matricule_decision: string | null;
  utilisateur_matricule: string;
  utilisateur_nom: string;
  utilisateur_prenom: string;
  utilisateur_service: number;
  service_nom: string | null;
  validateur_nom: string | null;
  validateur_prenom: string | null;
  nb_jours: number;
  ventilation: VentilationItem[];
  titre_annees: string;
}

// ═══════════════════════════════════════════════════════════════
// Service
// ═══════════════════════════════════════════════════════════════

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost/api';

  profil    = signal<AdminProfil | null>(null);
  kpis      = signal<AdminKpis | null>(null);
  demandes  = signal<DemandeAdmin[]>([]);
  isLoading = signal(false);

  // Demandes à valider par l'admin (niveau 2)
  demandesEnAttente = computed(() =>
    this.demandes().filter(d =>
      d.demande_status === 'en_attente' && d.demande_niveau_validation === 2
    )
  );

  // Demandes acceptées
  demandesAcceptees = computed(() =>
    this.demandes().filter(d => d.demande_status === 'acceptee')
  );

  // Demandes refusées
  demandesRefusees = computed(() =>
    this.demandes().filter(d => d.demande_status === 'refusee')
  );

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

  accepter(demandeId: number) {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/demande_valider.php`,
      { demande_id: demandeId, decision: 'acceptee' }
    );
  }

  refuser(demandeId: number, motifRefus: string) {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/demande_valider.php`,
      { demande_id: demandeId, decision: 'refusee', motif_refus: motifRefus }
    );
  }
}