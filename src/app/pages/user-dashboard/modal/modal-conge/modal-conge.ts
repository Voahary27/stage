import { Component, EventEmitter, Output, inject, signal, computed} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SoldeService } from '../../../../services/solde.service';
import { dateAfter, dateNotInPast } from '../../../../validators/date.validators';



interface VentilationItem {
  annee: number;
  jours: number;
}

@Component({
  imports: [CommonModule,ReactiveFormsModule],
  selector: 'app-modal-conge',
  styleUrl: './modal-conge.css',
  templateUrl: './modal-conge.html',
})
export class ModalConge {
  // event
  @Output() fermer = new EventEmitter<void>();
  @Output() ajout  = new EventEmitter<void>();

  private http         = inject(HttpClient);
  private soldeService = inject(SoldeService);
  private apiUrl       = 'http://localhost/api';
  

  today = new Date().toISOString().split('T')[0];
  

  // recuperation des soldes
  soldes = this.soldeService.soldes;

  isLoading    = signal(false);
  errorMessage = signal('');

  form = new FormGroup({
    date_debut: new FormControl('', [Validators.required,dateNotInPast()]),
    date_fin:   new FormControl('', [Validators.required, dateAfter('date_debut')]),
    motif:      new FormControl('', Validators.required),
    lieu:       new FormControl('Madagascar')
  });

  // calcul en temps réel
  nbJours     = signal(0);
  ventilation = signal<VentilationItem[] | null>(null);

  // pour verifier la disponibilité du solde
   totalDispo = computed(() => this.soldeService.totalDisponible());

  //  je comprend pas 
  soldeInsuffisant = computed(() =>
    this.nbJours() > 0 && this.ventilation() === null
  );

  peutSoumettre = signal(false);

   constructor() {
    this.soldeService.chargerSoldes();

  this.form.valueChanges.subscribe(() => {
    this.recalculer();
    this.form.get('date_fin')?.updateValueAndValidity({ emitEvent: false });
  });
   }
    

  // recalcul constant 
   recalculer() {
    const d1 = this.form.value.date_debut;
    const d2 = this.form.value.date_fin;

    if (!d1 || !d2) {
      this.nbJours.set(0);
      this.ventilation.set(null);
      this.peutSoumettre.set(false);
      return;
    }

      
  const debut = new Date(d1);
    const fin   = new Date(d2);

    // calcul de la difference
    const diff = Math.floor((fin.getTime() - debut.getTime()) / 86400000) + 1;

    if (diff <= 0) {
      this.nbJours.set(0);
      this.ventilation.set(null);
      this.peutSoumettre.set(false);
      return;
    }

    this.nbJours.set(diff);
    this.ventilation.set(this.soldeService.ventiler(diff));

    this.peutSoumettre.set(
      this.form.valid &&
      this.nbJours() > 0 &&
      !this.soldeInsuffisant() &&
      !this.isLoading()
    );
  }

  // soumission
  soumettre() {
    this.form.markAllAsTouched();
    
    if (this.form.invalid) {
    return;
  }

   if (this.soldeInsuffisant()) {
    return;
  }

  if (this.nbJours() <= 0) {
    return;
  }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const payload = {
      type:       'conge',
      date_debut: this.form.value.date_debut,
      date_fin:   this.form.value.date_fin,
      motif:      this.form.value.motif,
      lieu:       this.form.value.lieu
   

    };

    this.http.post<any>(`${this.apiUrl}/demande_ajout.php`, payload).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success) {
          this.ajout.emit();
        } else {
          this.errorMessage.set(res.message || 'Erreur inconnue');
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Erreur de connexion au serveur.');
      }
    });
  }

   annuler() {
    this.fermer.emit();
  }

}
