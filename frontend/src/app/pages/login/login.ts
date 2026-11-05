import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="login-page">
      <div class="login-card fade-in">
        <div class="login-header">
          <h2>Login to Account</h2>
          <p>Welcome back! Please enter your details.</p>
        </div>
        
        <form (ngSubmit)="onLogin()" #loginForm="ngForm">
          <div class="alert alert-danger" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>

          <div class="form-group">
            <label for="email">Email Address</label>
            <div class="input-wrapper">
              <i class="fas fa-envelope"></i>
              <input 
                type="email" 
                id="email" 
                name="email" 
                [(ngModel)]="loginData.email" 
                required 
                placeholder="example@mail.com"
                #email="ngModel"
              >
            </div>
            <div class="error" *ngIf="email.invalid && email.touched">Please enter a valid email</div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <div class="input-wrapper">
              <i class="fas fa-lock"></i>
              <input 
                type="password" 
                id="password" 
                name="password" 
                [(ngModel)]="loginData.password" 
                required 
                placeholder="••••••••"
                #password="ngModel"
              >
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-block" [disabled]="loginForm.invalid">
            Login <i class="fas fa-sign-in-alt"></i>
          </button>
        </form>

        <div class="login-footer">
          <p>Don't have an account? <a routerLink="/register">Create Account</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 80vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-offset);
      padding: 40px 20px;
    }

    .login-card {
      background: white;
      padding: 40px;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.05);
      width: 100%;
      max-width: 450px;
    }

    .login-header {
      text-align: center;
      margin-bottom: 35px;
    }

    .login-header h2 {
      font-size: 1.8rem;
      margin-bottom: 10px;
      font-weight: 700;
    }

    .login-header p {
      color: var(--text-light);
      font-size: 0.95rem;
    }

    .form-group {
      margin-bottom: 25px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      font-size: 0.9rem;
    }

    .input-wrapper {
      position: relative;
    }

    .input-wrapper i {
      position: absolute;
      left: 15px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-light);
    }

    .input-wrapper input {
      width: 100%;
      padding: 12px 15px 12px 45px;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      outline: none;
      font-family: inherit;
      transition: var(--transition);
    }

    .input-wrapper input:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 4px rgba(0, 137, 208, 0.1);
    }

    .error {
      color: #ff4757;
      font-size: 0.8rem;
      margin-top: 5px;
    }

    .alert {
      padding: 12px 15px;
      border-radius: var(--radius);
      margin-bottom: 20px;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .alert-danger {
      background: #fff5f5;
      color: #e53e3e;
      border: 1px solid #feb2b2;
    }

    .btn-block {
      width: 100%;
      margin-top: 10px;
      padding: 14px;
    }

    .login-footer {
      margin-top: 30px;
      text-align: center;
      border-top: 1px solid var(--border);
      padding-top: 20px;
    }

    .login-footer p {
      font-size: 0.9rem;
      color: var(--text-light);
    }

    .login-footer a {
      color: var(--primary);
      font-weight: 600;
    }
  `]
})
export class LoginComponent {
  loginData = {
    email: '',
    password: ''
  };
  errorMessage: string = '';

  private authService = inject(AuthService);
  private router = inject(Router);

  onLogin() {
    this.errorMessage = '';
    
    // We send the keys exactly as the backend expects them.
    // Since USERNAME_FIELD = 'email', the backend usually expect { "email": "...", "password": "..." }
    // or { "username": "...", "password": "..." }. 
    // Given the previous code used 'email', let's stick to that but ensure it's sent.
    
    const credentials = {
      email: this.loginData.email,
      password: this.loginData.password
    };

    this.authService.login(credentials).subscribe({
      next: (res) => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        if (err.status === 401) {
          this.errorMessage = 'Invalid email or password. Please try again.';
        } else if (err.status === 400) {
          // If the backend returns 400, it might be due to missing/incorrect fields
          this.errorMessage = 'Check your credentials and try again.';
        } else {
          this.errorMessage = 'An error occurred during login. Please try again later.';
        }
      }
    });
  }
}
