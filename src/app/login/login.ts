import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

type Mode = 'login' | 'register';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {

  errorMessage   = signal<string>('');
  successMessage = signal<string>('');
  isLoading      = signal<boolean>(false);
  mode           = signal<Mode>('login');

  // Liste des services
  services = signal<any[]>([]);

  loginForm = new FormGroup({
    matricule: new FormControl('', [Validators.required]),
    password:  new FormControl('', [Validators.required])
  });

  registerForm = new FormGroup({
    matricule:    new FormControl('', [Validators.required]),
    nom:          new FormControl('', [Validators.required]),
    prenom:       new FormControl('', [Validators.required]),
    email:        new FormControl(''),
    contact:      new FormControl(''),
    fonction:     new FormControl(''),
    service:      new FormControl('', [Validators.required]),
    direction:    new FormControl(''),
    corps:        new FormControl(''),
    date_service: new FormControl('', [Validators.required]),
    password:     new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  private apiUrl = 'http://localhost/api';
  private http   = inject(HttpClient);
  private router = inject(Router);

  ngOnInit() {
    this.chargerServices();
  }

  chargerServices() {
    this.http.get<any>(`${this.apiUrl}/services.php`).subscribe({
      next: (res) => {
        if (res.success) this.services.set(res.services);
      },
      error: (err) => console.error('Erreur services.php:', err)
    });
  }

  switchMode(m: Mode) {
    this.mode.set(m);
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  onSubmitLogin(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    this.http.post<any>(`${this.apiUrl}/login.php`, this.loginForm.value)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => {
          if (res.success) {
            localStorage.setItem('auth_token', res.token);
            localStorage.setItem('user_role', res.role);
            localStorage.setItem('user_matricule', res.matricule);

            this.router.navigate(
              res.role === 'admin' ? ['admin-Home'] : ['user-Home']
            );
          } else {
            this.errorMessage.set(res.message);
          }
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Erreur de connexion au serveur.');
        }
      });
  }

  onSubmitRegister() {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    this.http.post<any>(`${this.apiUrl}/register.php`, this.registerForm.value)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.successMessage.set('Inscription réussie ! Vous pouvez vous connecter.');

            const matricule = this.registerForm.value.matricule || '';

            setTimeout(() => {
              this.registerForm.reset();
              this.switchMode('login');
              this.loginForm.patchValue({ matricule });
            }, 2000);
          } else {
            this.errorMessage.set(res.message);
          }
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Erreur serveur.');
        }
      });
  }
}