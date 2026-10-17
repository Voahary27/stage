import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../services/user.service';
import { ToastService } from '../../services/toast.service';
import { Navbar } from '../../components/navbar/navbar';
import { ModalDetailDemande } from '../admin-dashboard/modal/modal-detail-demande/modal-detail-demande';
import { ModalRefus } from '../admin-dashboard/modal/modal-refus/modal-refus';

@Component({
  selector: 'app-demandes-recues',
  imports: [CommonModule, Navbar, ModalDetailDemande, ModalRefus],
  templateUrl: './demandes-recues.html',
  styleUrl: './demandes-recues.css'
})
export class DemandesRecues implements OnInit {
  private http  = inject(HttpClient);
  private toast = inject(ToastService);
  userService   = inject(UserService);

  private apiUrl = 'http://localhost/api';

  profil = this.userService.profil;
  role   = computed(() => this.profil()?.utilisateur_role || '');

  // Filtres par statut
  demandes    = signal<any[]>([]);
  isLoading   = signal(false);
  ongletActif = signal(0);

  demandesEnAttente = computed(() =>
    this.demandes().filter(d => d.demande_status === 'en_attente')
  );
  demandesAcceptees = computed(() =>
    this.demandes().filter(d => d.demande_status === 'acceptee')
  );
  demandesRefusees = computed(() =>
    this.demandes().filter(d => d.demande_status === 'refusee')
  );

  // Modales
  demandeSelectionnee = signal<any | null>(null);
  demandeARefuser     = signal<any | null>(null);

  ngOnInit() {
    // Charger le profil si ce n'est pas déjà fait
    if (!this.profil()) {
      this.userService.chargerTout().subscribe(() => this.charger());
    } else {
      this.charger();
    }
  }

  charger() {
    this.isLoading.set(true);
    this.http.get<any>(`${this.apiUrl}/demandes_recues.php`).subscribe({
      next: (res) => {
        if (res.success) this.demandes.set(res.demandes);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur demandes_recues.php:', err);
        this.isLoading.set(false);
      }
    });
  }

  changerOnglet(i: number) { this.ongletActif.set(i); }

  // ─── Détails ─────────────────────────────────────────────
  ouvrirDetail(d: any)     { this.demandeSelectionnee.set(d); }
  fermerDetail()           { this.demandeSelectionnee.set(null); }

  // ─── Accepter ────────────────────────────────────────────
  accepter(d: any) {
    const label = `${d.utilisateur_nom} ${d.utilisateur_prenom}`;
    if (!confirm(`Accepter la demande de ${label} ?`)) return;

    this.http.post<any>(`${this.apiUrl}/demande_valider.php`, {
      demande_id: d.demande_id,
      decision: 'acceptee'
    }).subscribe({
      next: (res) => {
        if (res.success) {
          this.toast.success(res.message || 'Demande validée');
          this.charger();
        } else {
          this.toast.error(res.message || 'Erreur');
        }
      },
      error: (err) => this.toast.error(err.error?.message || 'Erreur serveur')
    });
  }

  // ─── Refuser ─────────────────────────────────────────────
  refuser(d: any)          { this.demandeARefuser.set(d); }
  fermerModalRefus()       { this.demandeARefuser.set(null); }

  confirmerRefus(motif: string) {
    const d = this.demandeARefuser();
    if (!d) return;

    this.http.post<any>(`${this.apiUrl}/demande_valider.php`, {
      demande_id: d.demande_id,
      decision: 'refusee',
      motif_refus: motif
    }).subscribe({
      next: (res) => {
        if (res.success) {
          this.toast.success('Demande refusée');
          this.demandeARefuser.set(null);
          this.charger();
        } else {
          this.toast.error(res.message || 'Erreur');
        }
      },
      error: (err) => this.toast.error(err.error?.message || 'Erreur serveur')
    });
  }

  // ─── Helpers ─────────────────────────────────────────────
  formatDates(d: any): string {
    const debut = new Date(d.demande_date_debut).toLocaleDateString('fr-FR');
    if (!d.demande_date_fin) return debut;
    const fin = new Date(d.demande_date_fin).toLocaleDateString('fr-FR');
    return `${debut} → ${fin}`;
  }

  formatDateCreation(dateStr: string): string {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    const today = new Date();

    if (date.toDateString() === today.toDateString()) {
      return "Aujourd'hui " + date.toLocaleTimeString('fr-FR', {
        hour: '2-digit', minute: '2-digit'
      });
    }

    const hier = new Date();
    hier.setDate(hier.getDate() - 1);
    if (date.toDateString() === hier.toDateString()) {
      return 'Hier ' + date.toLocaleTimeString('fr-FR', {
        hour: '2-digit', minute: '2-digit'
      });
    }

    return date.toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    }) + ' ' + date.toLocaleTimeString('fr-FR', {
      hour: '2-digit', minute: '2-digit'
    });
  }
}