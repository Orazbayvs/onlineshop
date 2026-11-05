import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MapComponent } from '../../components/map/map';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MapComponent],
  template: `
    <div class="register-page">
      <div class="register-card fade-in">
        <div class="register-header">
          <h2>Create Account</h2>
          <p>Join OnlineShop today and start shopping or selling!</p>
        </div>
        
        <form (ngSubmit)="onRegister()" #regForm="ngForm">
          <div class="role-selection">
            <label>I want to be a:</label>
            <div class="role-btns">
              <div class="role-option" [class.active]="userData.role === 'buyer'" (click)="userData.role = 'buyer'">
                 <i class="fas fa-shopping-bag"></i>
                 <span>Buyer</span>
              </div>
              <div class="role-option" [class.active]="userData.role === 'seller'" (click)="userData.role = 'seller'">
                 <i class="fas fa-store"></i>
                 <span>Seller</span>
              </div>
            </div>
          </div>

          <!-- Seller Warning -->
          <div class="seller-warning" *ngIf="userData.role === 'seller'">
            <i class="fas fa-exclamation-triangle"></i>
            <p>Important: A service fee of <strong>5%</strong> will be charged from every sale for your shop listing.</p>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label for="fname">First Name</label>
              <input type="text" id="fname" name="fname" [(ngModel)]="userData.first_name" required placeholder="John">
            </div>
            <div class="form-group">
              <label for="lname">Last Name</label>
              <input type="text" id="lname" name="lname" [(ngModel)]="userData.last_name" required placeholder="Doe">
            </div>
          </div>

          <div class="form-group">
            <label for="email">Email Address</label>
            <input type="email" id="email" name="email" [(ngModel)]="userData.email" required placeholder="john@example.com">
          </div>

          <div class="form-group">
            <label for="phone">Phone (optional)</label>
            <input type="tel" id="phone" name="phone" [(ngModel)]="userData.phone" maxlength="20" placeholder="+7 700 000 00 00">
          </div>

          <div class="form-group">
            <label for="address">Address</label>
            <input type="text" id="address" name="address" [(ngModel)]="userData.address" maxlength="200" required placeholder="Street, building, apartment, city">
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" [(ngModel)]="userData.password" required placeholder="••••••••">
          </div>

          <!-- Seller Specific Fields -->
          <div class="seller-fields" *ngIf="userData.role === 'seller'">
            <div class="form-group">
              <label for="shopName">Shop Name</label>
              <input type="text" id="shopName" name="shopName" [(ngModel)]="userData.shop_name" required placeholder="My Amazing Shop">
            </div>
            <div class="form-group">
              <label for="shopAddr">Shop Address</label>
              <div class="input-with-btn">
                <input type="text" id="shopAddr" name="shopAddr" [(ngModel)]="userData.shop_address" required placeholder="Enter address to see on map...">
                <button type="button" class="btn-icon" (click)="showOnMap()"><i class="fas fa-map-marker-alt"></i></button>
              </div>
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-block" [disabled]="regForm.invalid">
            Create Account <i class="fas fa-user-plus"></i>
          </button>
        </form>

        <div class="register-footer">
          <p>Already have an account? <a routerLink="/login">Login</a></p>
        </div>
      </div>

      <!-- Real Map Preview -->
      <div class="map-wrapper" *ngIf="userData.role === 'seller'">
         <app-map [address]="mapAddress"></app-map>
      </div>
    </div>
  `,
  styles: [`
    .register-page {
      min-height: 90vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: var(--bg-offset);
      padding: 60px 20px;
      gap: 30px;
    }

    .register-card {
      background: white;
      padding: 40px;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.05);
      width: 100%;
      max-width: 550px;
    }

    .register-header { text-align: center; margin-bottom: 30px; }
    .register-header h2 { font-size: 1.8rem; margin-bottom: 8px; font-weight: 700; }
    
    .role-selection { margin-bottom: 25px; }
    .role-selection label { display: block; margin-bottom: 15px; font-weight: 600; text-align: center; }
    
    .role-btns {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }

    .role-option {
      border: 2px solid var(--border);
      padding: 15px;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      transition: var(--transition);
    }

    .role-option i { font-size: 1.5rem; color: var(--text-light); }
    .role-option span { font-weight: 600; font-size: 0.9rem; }

    .role-option:hover { border-color: var(--primary); }
    .role-option.active {
      border-color: var(--primary);
      background: rgba(0, 137, 208, 0.05);
    }
    .role-option.active i { color: var(--primary); }

    .seller-warning {
      background: #fff5f5;
      border: 1px solid #feb2b2;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 25px;
      display: flex;
      gap: 12px;
      align-items: flex-start;
      color: #c53030;
      font-size: 0.85rem;
    }

    .seller-warning i { font-size: 1.2rem; margin-top: 2px; }

    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
    .form-group { margin-bottom: 20px; }
    .form-group label { display: block; margin-bottom: 8px; font-weight: 500; font-size: 0.85rem; }
    
    .form-group input {
      width: 100%;
      padding: 12px;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      outline: none;
      font-family: inherit;
    }

    .input-with-btn { position: relative; }
    .btn-icon {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      background: var(--primary);
      color: white;
      border: none;
      width: 35px;
      height: 35px;
      border-radius: 6px;
      cursor: pointer;
    }

    .btn-block { width: 100%; padding: 14px; margin-top: 20px; }

    .register-footer { margin-top: 25px; text-align: center; color: var(--text-light); font-size: 0.9rem; }
    .register-footer a { color: var(--primary); font-weight: 600; }

    .map-wrapper {
      width: 100%;
      max-width: 550px;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
    }
  `]
})
export class RegisterComponent {
  userData = {
    role: 'buyer',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    shop_name: '',
    shop_address: ''
  };

  mapAddress = '';

  constructor(private auth: AuthService, private router: Router) {}

  onRegister() {
    this.auth.register(this.userData).subscribe({
      next: () => this.router.navigate(['/login']),
      error: (err) => alert('Registration failed: ' + JSON.stringify(err.error))
    });
  }

  showOnMap() {
    this.mapAddress = this.userData.shop_address;
  }
}
