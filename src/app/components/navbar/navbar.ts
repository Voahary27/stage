import { Component, OnInit, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit {
  router = inject(Router);
  private http = inject(HttpClient);

  private apiUrl = 'http://localhost/api';

  profil = signal<any>(null);

  ngOnInit() {
    this.http.get<any>(`${this.apiUrl}/whoami.php`).subscribe({
      next: (res) => {
        if (res.success) this.profil.set(res.profil);
      },
      error: (err) => console.error('Erreur whoami.php:', err)
    });
  }

  estAdmin = computed(() => this.profil()?.utilisateur_role === 'admin');

  peutVoirDemandesRecues = computed(() => {
    const role = this.profil()?.utilisateur_role;
    return role === 'chef' || role === 'sg';
  });

  allerAccueil() {
    const role = this.profil()?.utilisateur_role;
    if (role === 'admin') {
      this.router.navigate(['/admin-Home']);
    } else {
      this.router.navigate(['/user-Home']);
    }
  }

  allerProfil() {
    this.router.navigate(['/profil']);
  }

  allerDemandesRecues() {
    this.router.navigate(['/demandes-recues']);
  }

  allerGestionUtilisateurs() {
    this.router.navigate(['/gestion-utilisateurs']);
  }

  deconnexion() {
    localStorage.clear();
    this.router.navigate(['/']);
  }
}