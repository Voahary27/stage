import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  loginForm = new FormGroup({
    matricule: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required])
  });

  // Signals 
  errorMessage = signal<string>('');
  isLoading = signal<boolean>(false);

  // url du Back end PHP
  private apiUrl = 'http://localhost/api/login.php';
  private http = inject(HttpClient);
  private router = inject(Router);

  onSubmit(): void {
    this.errorMessage.set('');

    if (this.loginForm.valid) {
      this.isLoading.set(true);
      const credentials = this.loginForm.value;

      this.http.post<any>(this.apiUrl, credentials).pipe(finalize( ()=> this.isLoading.set(false))).subscribe({
        next: (response) => {
          

          if (response.success) {
            localStorage.setItem('auth_token', response.token);
            localStorage.setItem('user_role', response.role);
            localStorage.setItem('user_matricule', response.matricule);


            if (response.role === 'administrateur') {
              this.router.navigate(['admin-Home']);
            } else {
              this.router.navigate(['user-Home']);
            }
          } else {
            this.errorMessage.set(response.message);
          }
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Erreur de connexion au serveur.');
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}

