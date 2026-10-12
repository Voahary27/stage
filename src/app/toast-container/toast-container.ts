import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../services/toast.service'

@Component({
  imports: [CommonModule],
  selector: 'app-toast-container',
  styleUrl: './toast-container.css',
  templateUrl: './toast-container.html',
})
export class ToastContainer {
  toastService = inject(ToastService)
}
