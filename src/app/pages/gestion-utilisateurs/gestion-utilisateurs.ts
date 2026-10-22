import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Navbar } from '../../components/navbar/navbar';
import { AdminUsersService, UtilisateurAdmin } from '../../services/admin-users.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-gestion-utilisateurs',
  imports: [CommonModule, FormsModule, Navbar],
  templateUrl: './gestion-utilisateurs.html',
  styleUrl: './gestion-utilisateurs.css'
})

export class GestionUtilisateurs implements OnInit {
    adminUsersService = inject(AdminUsersService);
    private toast     = inject(ToastService);
    private router    = inject(Router);

  actifs    = this.adminUsersService.actifs;
  nouveaux  = this.adminUsersService.nouveaux;
  isLoading = this.adminUsersService.isLoading;

  ongletActif = this.adminUsersService.ongletActif;
  recherche   = this.adminUsersService.recherche;

  // Listes filtrées
  actifsFiltres = computed(() => {
    const q = this.recherche().toLowerCase().trim();
    if (!q) return this.actifs();
    return this.actifs().filter(u => this.match(u, q));
  });

  nouveauxFiltres = computed(() => {
    const q = this.recherche().toLowerCase().trim();
    if (!q) return this.nouveaux();
    return this.nouveaux().filter(u => this.match(u, q));
  });

 ngOnInit() {
    this.adminUsersService.chargerUtilisateurs();
  }

  private match(u: UtilisateurAdmin, q: string): boolean {
    const nom     = (u.utilisateur_nom || '').toLowerCase();
    const prenom  = (u.utilisateur_prenom || '').toLowerCase();
    const matric  = (u.utilisateur_matricule || '').toLowerCase();
    const service = (u.service_nom || '').toLowerCase();
    return nom.includes(q) || prenom.includes(q) || matric.includes(q) || service.includes(q);
  }

changerOnglet(i: number) {
    this.ongletActif.set(i);
  }

  // Double-clic sur une ligne
  ouvrirProfil(u: UtilisateurAdmin) {
    this.router.navigate(['/profil', u.utilisateur_matricule]);
  }

  // Définir solde (même action que le double-clic)
  definirSolde(u: UtilisateurAdmin) {
    this.router.navigate(['/profil', u.utilisateur_matricule]);
  }

  // Supprimer
  supprimer(u: UtilisateurAdmin, event: Event) {
    event.stopPropagation();   // ← empêche le double-clic de s'ouvrir

    const label = `${u.utilisateur_nom} ${u.utilisateur_prenom}`;
    const confirmMsg = `⚠️ ATTENTION\n\nVous êtes sur le point de supprimer DÉFINITIVEMENT :\n\n${label} (${u.utilisateur_matricule})\n\nToutes ses données seront supprimées :\n- Profil\n- Soldes annuels\n- Demandes\n\nCette action est IRRÉVERSIBLE. Confirmer ?`;

    if (!confirm(confirmMsg)) return;

    this.adminUsersService.supprimer(u.utilisateur_matricule).subscribe({
      next: (res) => {
        if (res.success) {
          this.toast.success(res.message || 'Utilisateur supprimé');
          this.adminUsersService.chargerUtilisateurs(true);
        } else {
          this.toast.error(res.message || 'Erreur');
        }
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Erreur serveur');
      }
    });
  }


}