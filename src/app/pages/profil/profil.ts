import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../services/user.service';
import { SoldeService } from '../../services/solde.service';
import { Navbar } from '../../components/navbar/navbar';
import { ModalSolde } from '../admin-dashboard/modal/modal-solde/modal-solde';
import { ToastService } from '../../services/toast.service';
import { AdminUsersService } from '../../services/admin-users.service';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [CommonModule, Navbar,ModalSolde, FormsModule],
  selector: 'app-profil',
  styleUrl: './profil.css',
  templateUrl: './profil.html',
})
export class Profil implements OnInit {
  userService  = inject(UserService);
  private adminUsersService = inject(AdminUsersService);
  soldeService = inject(SoldeService);
  private route  = inject(ActivatedRoute);
  private router = inject(Router);
  private http   = inject(HttpClient);
  private toast = inject(ToastService);

  private apiUrl = 'http://localhost/api';

  profil    = signal<any>(null);
  soldes    = signal<any[]>([]);
  isLoading = signal(false);
  modeAdmin = signal(false);
  matriculeAdmin = signal('');
  modalSoldeOuverte = signal(false);
modalSoldeMode    = signal<'add' | 'edit'>('add');
soldeEnEdition    = signal<{annee: number, valeur: number} | null>(null);
editMode= signal(false);
nouveauRole = signal<string>('');
monMatricule = signal(localStorage.getItem('user_matricule') || '');

formEdit = signal({
  nom:          '',
  prenom:       '',
  email:        '',
  contact:      '',
  fonction:     '',
  service:      null as number | null,
  direction:    '',
  corps:        ''
});

services = signal<any[]>([]);


  ngOnInit() {
    const matriculeParam = this.route.snapshot.paramMap.get('matricule');

    if (matriculeParam) {
      
      this.modeAdmin.set(true);
      this.matriculeAdmin.set(matriculeParam);
      this.chargerDetailAdmin(matriculeParam);
    } else {
      
      this.userService.chargerTout().subscribe();
      this.soldeService.chargerSoldes();
      this.profil = this.userService.profil;
      this.soldes = this.soldeService.soldes;
    }

    this.chargerServices();
  }

  ouvrirEdition() {
  const p = this.profil();
  if (!p) return;

  this.formEdit.set({
    nom:       p.utilisateur_nom          || '',
    prenom:    p.utilisateur_prenom       || '',
    email:     p.utilisateur_email        || '',
    contact:   p.utilisateur_contact      || '',
    fonction:  p.utilisateur_fonction     || '',
    service:   p.utilisateur_service      ?? null,
    direction: p.utilisateur_direction    || '',
    corps:     p.utilisateur_corps        || ''
  });
  this.editMode.set(true);
}

annulerEdition() {
  this.editMode.set(false);
}

// Mettre à jour un champ du formulaire
updateForm(field: string, value: any) {
  this.formEdit.update(f => ({ ...f, [field]: value }));
}


enregistrerProfil() {
  const f = this.formEdit();

  if (!f.nom || !f.prenom) {
    this.toast.error('Le nom et le prénom sont obligatoires');
    return;
  }
 this.http.post<any>(`${this.apiUrl}/user_update.php`, f).subscribe({
    next: (res) => {
      if (res.success) {
        this.toast.success('Profil mis à jour');
        this.editMode.set(false);

        // Recharger
        if (this.modeAdmin()) {
          this.chargerDetailAdmin(this.matriculeAdmin());
        } else {
          this.userService.chargerTout().subscribe();
        }
      } else {
        this.toast.error(res.message || 'Erreur');
      }
    },
    error: (err) => this.toast.error(err.error?.message || 'Erreur serveur')
  });
}

chargerServices() {
  this.http.get<any>(`${this.apiUrl}/services.php`).subscribe({
    next: (res) => {
      if (res.success) this.services.set(res.services);
    }
  });
}

changerRole() {
  const nouveau = this.nouveauRole();
  if (!nouveau) return;

  const label = `${this.profil()?.utilisateur_nom} ${this.profil()?.utilisateur_prenom}`;
  const ancien = this.profil()?.utilisateur_role;

  const msg = `Changer le rôle de ${label} ?\n\nDe : ${ancien}\nVers : ${nouveau}`;
  if (!confirm(msg)) return;

  this.adminUsersService.changerRole(this.matriculeAdmin(), nouveau).subscribe({
    next: (res) => {
      if (res.success) {
        this.toast.success('Rôle mis à jour');
        this.nouveauRole.set('');
        this.chargerDetailAdmin(this.matriculeAdmin());
      } else {
        this.toast.error(res.message || 'Erreur');
      }
    },
    error: (err) => this.toast.error(err.error?.message || 'Erreur serveur')
  });
}

  chargerDetailAdmin(matricule: string) {
    this.isLoading.set(true);
    this.http.get<any>(`${this.apiUrl}/admin_user.php?action=detail&matricule=${matricule}`).subscribe({
      next: (res) => {
        if (res.success) {
          this.profil.set(res.profil);
          this.soldes.set(res.soldes);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur admin_user_detail.php:', err);
        this.isLoading.set(false);
      }
    });
  }

  retourAccueil() {
    if (this.modeAdmin()) {
      this.router.navigate(['/gestion-utilisateurs']);
    } else {
      this.router.navigate(['/user-Home']);
    }
  }

  retourListe() {
  this.router.navigate(['/gestion-utilisateurs']);
}

  totalActuel(): number {
    return this.soldes().reduce((sum, s) => sum + Number(s.solde_annuel_valeur || 0), 0);
  }

  totalInitial(): number {
    return this.soldes().length * 30;
  }

  ouvrirAjoutSolde() {
  this.modalSoldeMode.set('add');
  this.soldeEnEdition.set(null);
  this.modalSoldeOuverte.set(true);
}

ouvrirEditionSolde(s: any) {
  this.modalSoldeMode.set('edit');
  this.soldeEnEdition.set({ annee: s.solde_annuel_annee, valeur: s.solde_annuel_valeur });
  this.modalSoldeOuverte.set(true);
}

fermerModalSolde() {
  this.modalSoldeOuverte.set(false);
  this.soldeEnEdition.set(null);
}

onSoldeModifie() {
  this.modalSoldeOuverte.set(false);
  this.soldeEnEdition.set(null);
  this.toast.success('Solde enregistré');
  this.chargerDetailAdmin(this.matriculeAdmin());
}

supprimerSolde(s: any) {
  const msg = `Supprimer le solde ${s.solde_annuel_annee} ?\n\n${s.solde_annuel_valeur} jour(s) seront perdus.`;
  if (!confirm(msg)) return;

  this.http.post<any>(`${this.apiUrl}/admin_solde.php`, {
    action: 'delete',
    matricule: this.matriculeAdmin(),
    annee: s.solde_annuel_annee
  }).subscribe({
    next: (res) => {
      if (res.success) {
        this.toast.success(res.message || 'Solde supprimé');
        this.chargerDetailAdmin(this.matriculeAdmin());
      } else {
        this.toast.error(res.message || 'Erreur');
      }
    },
    error: (err) => this.toast.error(err.error?.message || 'Erreur serveur')
  });
}

  formatDate(d: string | null): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  }
}