import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DemandeAdmin, VentilationItem } from '../../../../services/admin.service';

@Component({
  imports: [CommonModule],
  selector: 'app-modal-detail-demande',
  styleUrl: './modal-detail-demande.css',
  templateUrl: './modal-detail-demande.html',
})
export class ModalDetailDemande {
  @Input() demande!: DemandeAdmin;
  @Output() fermer = new EventEmitter<void>();

   formatDate(d: string | null): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  }
  
  formatDateTime(d: string | null): string {
    if (!d) return '—';
    const date = new Date(d);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    }) + ' à ' + date.toLocaleTimeString('fr-FR', {
      hour: '2-digit', minute: '2-digit'
    });
  }

  formatVentilation(): string {
    if (!this.demande?.ventilation || this.demande.ventilation.length === 0) {
      return '—';
    }
    return this.demande.ventilation
      .map((v: VentilationItem) => `${v.annee} (${v.jours} j)`)
      .join(', ');
  }

  fermerModal() {
    this.fermer.emit();
  }

}
