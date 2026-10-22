import { Component, EventEmitter, Input, Output, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-modal-solde',
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-solde.html',
  styleUrl: './modal-solde.css'
})
export class ModalSolde implements OnInit {
  @Input() matricule!: string;
  @Input() mode: 'add' | 'edit' = 'add';
  @Input() anneeExistante?: number;
  @Input() valeurExistante?: number;

  @Output() confirmer = new EventEmitter<void>();
  @Output() annuler   = new EventEmitter<void>();

  private http = inject(HttpClient);
  private apiUrl = 'http://localhost/api';

  annee     = signal<number>(new Date().getFullYear());
  valeur    = signal<number>(30);
  isLoading = signal(false);
  errorMsg  = signal('');

  ngOnInit() {
    // Pré-remplir en mode édition
    if (this.mode === 'edit') {
      if (this.anneeExistante)  this.annee.set(this.anneeExistante);
      if (this.valeurExistante !== undefined) this.valeur.set(this.valeurExistante);
    }
  }

  valider() {
    const a = Number(this.annee());
    const v = Number(this.valeur());

    if (a < 2000 || a > 2100) {
      this.errorMsg.set('Année invalide (2000-2100)');
      return;
    }
    if (v < 0 || v > 60) {
      this.errorMsg.set('Valeur invalide (0 à 60)');
      return;
    }

    this.errorMsg.set('');
    this.isLoading.set(true);

    this.http.post<any>(`${this.apiUrl}/admin_solde.php`, {
      action: this.mode === 'add' ? 'add' : 'update',
      matricule: this.matricule,
      annee: a,
      valeur: v
    }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success) {
          this.confirmer.emit();
        } else {
          this.errorMsg.set(res.message);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMsg.set(err.error?.message || 'Erreur serveur');
      }
    });
  }

  fermer() {
    this.annuler.emit();
  }
}