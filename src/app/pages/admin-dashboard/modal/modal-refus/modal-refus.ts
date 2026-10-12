import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal-refus',
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-refus.html',
  styleUrl: './modal-refus.css'
})
export class ModalRefus {
  @Input() demandeId!: number;
  @Output() confirmer = new EventEmitter<string>();
  @Output() annuler   = new EventEmitter<void>();

  motif = signal('');
  errorMessage = signal('');

  valider() {
    const m = this.motif().trim();

    if (m.length < 3) {
      this.errorMessage.set('Le motif doit contenir au moins 3 caractères.');
      return;
    }

    this.confirmer.emit(m);
  }

  fermer() {
    this.annuler.emit();
  }
}