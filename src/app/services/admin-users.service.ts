import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';


export interface UtilisateurAdmin {
  utilisateur_matricule: string;
  utilisateur_nom: string;
  utilisateur_prenom: string;
  utilisateur_role: string;
  utilisateur_service: number | null;
  service_nom: string | null;
  nb_soldes: number;
}

@Injectable({ providedIn: 'root' })
export class AdminUsersService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost/api';

  actifs    = signal<UtilisateurAdmin[]>([]);
  nouveaux  = signal<UtilisateurAdmin[]>([]);
  isLoading = signal(false);

  ongletActif = signal(0);
  recherche   = signal('');

  private dejaCharge = false;

  chargerUtilisateurs(force = false) {
    if (this.dejaCharge && !force) return;

    this.isLoading.set(true);

    this.http.get<any>(`${this.apiUrl}/admin_user.php?action=list`).subscribe({
      next: (res) => {
        if (res.success) {
          this.actifs.set(res.actifs);
          this.nouveaux.set(res.nouveaux);
          this.dejaCharge = true;
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur admin_user.php:', err);
        this.isLoading.set(false);
      }
    });
  }

  chargerDetail(matricule: string) {
    return this.http.get<any>(
      `${this.apiUrl}/admin_user.php?action=detail&matricule=${matricule}`
    );
  }

  changerRole(matricule: string, role: string) {
    return this.http.post<any>(
      `${this.apiUrl}/admin_user.php?action=role`,
      { matricule, role }
    );
  }

  supprimer(matricule: string) {
    return this.http.post<any>(
      `${this.apiUrl}/admin_user.php?action=delete`,
      { matricule }
    );
  }

  reset() {
    this.dejaCharge = false;
    this.ongletActif.set(0);
    this.recherche.set('');
  }
}