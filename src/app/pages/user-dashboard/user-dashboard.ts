import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { SoldeService } from '../../services/solde.service';
import { ToastService } from '../../services/toast.service';
import { ModalPermission } from './modal/modal-permission/modal-permission';
import { ModalConge } from './modal/modal-conge/modal-conge';
import { Navbar } from '../../components/navbar/navbar';  

@Component({
  imports: [CommonModule, Navbar,ModalPermission, ModalConge],
  selector: 'app-user-dashboard',
  styleUrl: './user-dashboard.css',
  templateUrl: './user-dashboard.html',
})
export class UserDashboard implements OnInit {
  userService  = inject(UserService);
  private soldeService = inject(SoldeService);
  private toast = inject(ToastService);

  profil   = this.userService.profil;
  kpis     = this.userService.kpis;
  demandes = this.userService.demandes;

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

  formatDates(d: any): string {
    const debut = new Date(d.demande_date_debut).toLocaleDateString('fr-FR');
    if (!d.demande_date_fin) return debut;
    const fin = new Date(d.demande_date_fin).toLocaleDateString('fr-FR');
    return debut === fin ? debut : `${debut} → ${fin}`;
  }
}