import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  router = inject(Router);
  userService = inject(UserService);

  profil = this.userService.profil;

  allerAccueil() {
    this.router.navigate(['/user-Home']);
  }

  allerProfil() {
    this.router.navigate(['/profil']);
  }

  allerDemandesRecues() {
  this.router.navigate(['/demandes-recues']);
}

peutVoirDemandesRecues = computed(() => {
  const role = this.profil()?.utilisateur_role;
  return role === 'chef' || role === 'sg';
});

  
  deconnexion() {
    localStorage.clear();
    this.router.navigate(['/']);
  }
}