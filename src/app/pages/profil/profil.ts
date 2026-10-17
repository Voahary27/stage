import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { SoldeService } from '../../services/solde.service';
import { Navbar } from '../../components/navbar/navbar';

@Component({
  imports: [CommonModule, Navbar],
  selector: 'app-profil',
  styleUrl: './profil.css',
  templateUrl: './profil.html',
})
export class Profil implements OnInit {
  userService  = inject(UserService);
  soldeService = inject(SoldeService);
  private router = inject(Router);

  profil    = this.userService.profil;
  isLoading = this.userService.isLoading;
  soldes    = this.soldeService.soldes;

  ngOnInit() {
    this.userService.chargerTout().subscribe();
    this.soldeService.chargerSoldes();
  }

  retourAccueil() {
    this.router.navigate(['/user-Home']);
  }

  totalActuel(): number {
    return this.soldeService.totalDisponible();
  }

  totalInitial(): number {
    return this.soldes().length * 30;
  }

  formatDate(d: string | null): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  }
}