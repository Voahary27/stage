import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);
  private nextId = 0;

  private show(message: string, type: Toast['type'], duration = 3000) {
    const id = this.nextId++;
    this.toasts.update(t => [...t, { id, message, type }]);

    setTimeout(() => this.remove(id), duration);
  }

  success(message: string, duration?: number) { this.show(message, 'success', duration); }
  error(message: string, duration?: number)   { this.show(message, 'error', duration); }
  info(message: string, duration?: number)    { this.show(message, 'info', duration); }

  remove(id: number) {
    this.toasts.update(t => t.filter(toast => toast.id !== id));
  }
}