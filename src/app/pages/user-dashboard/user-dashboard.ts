import { Component, OnInit, inject, computed,signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import { UserService } from '../../services/user.service';
import { SoldeService } from '../../services/solde.service';
import { ModalPermission } from './modal/modal-permission/modal-permission';
import { ToastService } from '../../services/toast.service';
import { ModalConge } from './modal/modal-conge/modal-conge';

@Component({
  imports: [CommonModule, ModalPermission,ModalConge],
  selector: 'app-user-dashboard',
  styleUrl: './user-dashboard.css',
  templateUrl: './user-dashboard.html',
})
export class UserDashboard implements OnInit{
  userService = inject(UserService);
  private soldeService = inject(SoldeService);
  private toast = inject(ToastService);

  //Modal
  modalPermissionOuverte = signal(false);
  modalCongeOuverte = signal(false);

   // Expose les signals du service au template
  profil = this.userService.profil;
  kpis = this.userService.kpis;
  demandes = this.userService.demandes;
  isLoading = this.userService.isLoading;

  // onglet actif
  ongletActif = signal<number>(0);

   //Demandes filtrées par état
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

  changerOnglet(index: number) {
    this.ongletActif.set(index);
  }
  
  ngOnInit() {
    // Charger les données lors de l'initialisation du composant
    this.userService.chargerTout().subscribe();
    this.soldeService.chargerSoldes();
  }

   ouvrirModalPermission() {
    this.modalPermissionOuverte.set(true);
  }

  ouvrirModalConge(){
    this.modalCongeOuverte.set(true)
  }

  fermerModalPermission() {
    this.modalPermissionOuverte.set(false);
  }

  fermerModalConge(){
    this.modalCongeOuverte.set(false);
  }

  onPermissionCreee() {
    this.modalPermissionOuverte.set(false);
    this.userService.chargerTout().subscribe();
    this.toast.success('Demande de permission envoyé avec succès')
  }

  
  onCongeCree() {
    this.modalCongeOuverte.set(false);
    this.userService.chargerTout().subscribe();
    this.soldeService.chargerSoldes(); 
    this.toast.success('Demande de conge envoyé avec succès')
  }  

  // formatage des dates 
  formatDates(d: any): string {
  const debut = new Date(d.demande_date_debut).toLocaleDateString('fr-FR');
  if (!d.demande_date_fin) return debut;
  const fin = new Date(d.demande_date_fin).toLocaleDateString('fr-FR');
  return debut === fin ? debut : `${debut} → ${fin}`;
  }
} 
