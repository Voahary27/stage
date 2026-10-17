import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, DemandeAdmin } from '../../services/admin.service';
import { ModalDetailDemande } from './modal/modal-detail-demande/modal-detail-demande';
import { ModalRefus } from './modal/modal-refus/modal-refus';
import { ToastService } from '../../services/toast.service';

@Component({
  imports: [CommonModule, ModalDetailDemande, ModalRefus],
  selector: 'app-admin-dashboard',
  styleUrl: './admin-dashboard.css',
  templateUrl: './admin-dashboard.html',
})
export class AdminDashboard implements OnInit {
  adminService = inject(AdminService);
  private toast = inject(ToastService);

  profil    = this.adminService.profil;
  kpis      = this.adminService.kpis;
  isLoading = this.adminService.isLoading;

  demandesEnAttente = this.adminService.demandesEnAttente;
  demandesAcceptees = this.adminService.demandesAcceptees;
  demandesRefusees  = this.adminService.demandesRefusees;

  ongletActif = signal(0);

  demandeSelectionnee = signal<DemandeAdmin | null>(null);
  demandeARefuser     = signal<DemandeAdmin | null>(null);

  isValidating = signal(false);

  ngOnInit() {
    this.adminService.chargerTout();
  }

  changerOnglet(index: number) {
    this.ongletActif.set(index);
  }

  // ─── Détails ─────────────────────────────────────────────
  ouvrirDetail(d: DemandeAdmin) {
    this.demandeSelectionnee.set(d);
  }

  fermerDetail() {
    this.demandeSelectionnee.set(null);
  }

  // ─── Accepter ────────────────────────────────────────────
  accepter(d: DemandeAdmin) {
    if (this.isValidating()) return;

    const label = `${d.utilisateur_nom} ${d.utilisateur_prenom}`;
    if (!confirm(`Accepter la demande de ${label} ?`)) return;

    this.isValidating.set(true);

    this.adminService.accepter(d.demande_id).subscribe({
      next: (res) => {
        this.isValidating.set(false);
        if (res.success) {
          this.toast.success(res.message || 'Demande acceptée avec succès');
          this.adminService.chargerTout();
        } else {
          this.toast.error(res.message || 'Erreur');
        }
      },
      error: (err) => {
        this.isValidating.set(false);
        this.toast.error(err.error?.message || 'Erreur serveur');
      }
    });
  }

  // ─── Refuser ─────────────────────────────────────────────
  refuser(d: DemandeAdmin) {
    this.demandeARefuser.set(d);
  }

  fermerModalRefus() {
    this.demandeARefuser.set(null);
  }

  confirmerRefus(motif: string) {
    const d = this.demandeARefuser();
    if (!d || this.isValidating()) return;

    this.isValidating.set(true);

    this.adminService.refuser(d.demande_id, motif).subscribe({
      next: (res) => {
        this.isValidating.set(false);
        if (res.success) {
          this.toast.success('Demande refusée');
          this.demandeARefuser.set(null);
          this.adminService.chargerTout();
        } else {
          this.toast.error(res.message || 'Erreur');
        }
      },
      error: (err) => {
        this.isValidating.set(false);
        this.toast.error(err.error?.message || 'Erreur serveur');
      }
    });
  }

  // ─── Formatage ───────────────────────────────────────────
  formatDates(d: DemandeAdmin): string {
    const debut = new Date(d.demande_date_debut).toLocaleDateString('fr-FR');
    if (!d.demande_date_fin) return debut;
    const fin = new Date(d.demande_date_fin).toLocaleDateString('fr-FR');
    return `${debut} → ${fin}`;
  }

  formatDateCreation(dateStr: string): string {
    if (!dateStr) return '—';

    const date = new Date(dateStr);
    const aujourdhui = new Date();

    if (date.toDateString() === aujourdhui.toDateString()) {
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