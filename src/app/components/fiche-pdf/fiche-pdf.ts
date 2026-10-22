import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-fiche-pdf',
  imports: [CommonModule],
  templateUrl: './fiche-pdf.html',
  styleUrl: './fiche-pdf.css'
})
export class FichePdf {
  @Input() demande: any = null;
  @Input() profil: any = null;

  // Date du jour formatée
  aujourdhui = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric'
  });

  annee(): number {
  return new Date().getFullYear();
}

  // Format date
  formatDate(d: string | null): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  }

  // Nombre de jours
  nbJours(): number {
    if (!this.demande?.demande_date_fin) return 0;
    const debut = new Date(this.demande.demande_date_debut);
    const fin   = new Date(this.demande.demande_date_fin);
    return Math.floor((fin.getTime() - debut.getTime()) / 86400000) + 1;
  }

  // Années impactées (via ventilation)
  anneesImpactees(): string {
    if (!this.demande?.ventilation || this.demande.ventilation.length === 0) {
      return '—';
    }
    return this.demande.ventilation
      .map((v: any) => v.annee)
      .join(', ');
  }

  // Reliquat (solde après déduction) par année
  reliquat(): string {
    if (!this.demande?.ventilation || this.demande.ventilation.length === 0) {
      return '—';
    }
    // La dernière année impactée (la plus récente)
    const derniereAnnee = this.demande.ventilation[this.demande.ventilation.length - 1];
    return `${derniereAnnee.jours} j (${derniereAnnee.annee})`;
  }
}