import { Component , EventEmitter, Output, inject, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import {  dateNotInPast } from '../../../../validators/date.validators';


@Component({
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'app-modal-permission',
  styleUrl: './modal-permission.css',
  templateUrl: './modal-permission.html',
})
export class ModalPermission {
  @Output() fermer = new EventEmitter<void>();
  @Output() ajout   = new EventEmitter<void>();

  today = new Date().toISOString().split('T')[0];

  private http = inject(HttpClient);
  private apiUrl = 'http://localhost/api';

  isLoading    = signal(false);
  errorMessage = signal('');

  // formulaire
 form = new FormGroup({
    date_debut: new FormControl('', [Validators.required, dateNotInPast()]),
    motif:      new FormControl('', Validators.required),
    lieu:       new FormControl('Madagascar')
  });

  // soumission
  soumettre() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
 
    this.isLoading.set(true);
    this.errorMessage.set('');

    // les info a envoyer
    const payload = {
      type:       'permission',
      date_debut: this.form.value.date_debut,
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
