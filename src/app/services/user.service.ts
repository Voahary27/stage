import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost/api'; // changer l'url en variable d'environnement

  // Signals partagés
  profil = signal<any>(null);
  kpis = signal<any>(null);
  demandes = signal<any[]>([]);
  isLoading = signal<boolean>(false);


  // charger la page avec les reponses de me.php
  chargerTout() {
    this.isLoading.set(true);

    return this.http.get<any>(`${this.apiUrl}/me.php`).pipe(
      tap({
        next: (res) => {
          if (res.success) {
            this.profil.set(res.profil);
            this.kpis.set(res.kpis);
            this.demandes.set(res.demandes);
          }
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Erreur me.php:', err);
          this.isLoading.set(false);
        }
      })
    );
  }
}