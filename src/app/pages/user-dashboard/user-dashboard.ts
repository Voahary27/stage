import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { SoldeService } from '../../services/solde.service';
import { ToastService } from '../../services/toast.service';
import { ModalPermission } from './modal/modal-permission/modal-permission';
import { ModalConge } from './modal/modal-conge/modal-conge';
import { Navbar } from '../../components/navbar/navbar';
import { HttpClient } from '@angular/common/http';
import { ModalDetailDemande } from '../admin-dashboard/modal/modal-detail-demande/modal-detail-demande';
import { FichePdf } from '../../components/fiche-pdf/fiche-pdf';

@Component({
  imports: [CommonModule, Navbar,ModalPermission, ModalConge, ModalDetailDemande, FichePdf],
  selector: 'app-user-dashboard',
  styleUrl: './user-dashboard.css',
  templateUrl: './user-dashboard.html',
})
export class UserDashboard implements OnInit {
  userService  = inject(UserService);
  private soldeService = inject(SoldeService);
  private toast = inject(ToastService);
  private http   = inject(HttpClient);
  private apiUrl = 'http://localhost/api';

  profil   = this.userService.profil;
  kpis     = this.userService.kpis;
  demandes = this.userService.demandes;

  demandeSelectionnee = signal<any | null>(null);
  ongletActif = signal(0);
  demandePourPdf = signal<any | null>(null);

  ouvrirDetail(d: any) {
  const p = this.profil();
  if (p) {
    this.demandeSelectionnee.set({
      ...d,
      utilisateur_nom:       p.utilisateur_nom,
      utilisateur_prenom:    p.utilisateur_prenom,
      utilisateur_matricule: p.utilisateur_matricule
    });
  } else {
    this.demandeSelectionnee.set(d);
  }
}

  fermerDetail() {
    this.demandeSelectionnee.set(null);
  }

  demandesEnAttente = computed(() =>
    this.demandes().filter(d => d.demande_status === 'en_attente')
  );

  demandesAcceptees = computed(() =>
    this.demandes().filter(d => d.demande_status === 'acceptee')
  );

  demandesRefusees = computed(() =>
    this.demandes().filter(d => d.demande_status === 'refusee')
  );

  demandesToutes = computed(() => this.demandes());

  modalPermissionOuverte = signal(false);
  modalCongeOuverte      = signal(false);

  ngOnInit() {
    this.userService.chargerTout().subscribe();
    this.soldeService.chargerSoldes();
  }

  changerOnglet(index: number) {
    this.ongletActif.set(index);
  }

  ouvrirModalPermission() { this.modalPermissionOuverte.set(true); }
  ouvrirModalConge()      { this.modalCongeOuverte.set(true); }
  fermerModalPermission() { this.modalPermissionOuverte.set(false); }
  fermerModalConge()      { this.modalCongeOuverte.set(false); }

  onPermissionCreee() {
    this.modalPermissionOuverte.set(false);
    this.userService.chargerTout().subscribe();
    this.toast.success('Demande de permission envoyée avec succès');
  }

  onCongeCree() {
    this.modalCongeOuverte.set(false);
    this.userService.chargerTout().subscribe();
    this.soldeService.chargerSoldes();
    this.toast.success('Demande de congé envoyée avec succès');
  }

  supprimerDemande(d: any, event: Event) {
    event.stopPropagation();

    const label = `${d.demande_type} du ${this.formatDates(d)}`;
    if (!confirm(`Supprimer cette demande ?\n\n${label}\n\nCette action est irréversible.`)) return;

    this.http.post<any>(`${this.apiUrl}/demande_delete.php`, {
      demande_id: d.demande_id
    }).subscribe({
      next: (res) => {
        if (res.success) {
          this.toast.success('Demande supprimée');
          this.userService.chargerTout().subscribe();
        } else {
          this.toast.error(res.message || 'Erreur');
        }
      },
      error: (err) => this.toast.error(err.error?.message || 'Erreur serveur')
    });
  }

   nbJours(d: any): number {
    if (!d.demande_date_fin) return 0;
    const debut = new Date(d.demande_date_debut);
    const fin   = new Date(d.demande_date_fin);
    return Math.floor((fin.getTime() - debut.getTime()) / 86400000) + 1;
  }

  // ═══ Générer PDF ═══
  imprimerFiche(d: any, event: Event) {
    event.stopPropagation();

  const p = this.profil();

  // Enrichir avec le profil (= demandeur)
  this.demandePourPdf.set({
    ...d,
    utilisateur_nom:       p?.utilisateur_nom,
    utilisateur_prenom:    p?.utilisateur_prenom,
    utilisateur_matricule: p?.utilisateur_matricule
  });

  // Nom du fichier PDF (via le titre de la page)
  const type = d.demande_type === 'conge' ? 'Conge' : 'Permission';
  const ancienTitre = document.title;
  document.title = `Fiche_${type}_${d.demande_id}`;

  setTimeout(() => {
    window.print();
    document.title = ancienTitre;
  }, 200);
  }

  formatDates(d: any): string {
    const debut = new Date(d.demande_date_debut).toLocaleDateString('fr-FR');
    if (!d.demande_date_fin) return debut;
    const fin = new Date(d.demande_date_fin).toLocaleDateString('fr-FR');
    return debut === fin ? debut : `${debut} → ${fin}`;
  }

  formatDateCreation(dateStr: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });
}

}