import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <header class="header">
      <div class="container header-wrap">
        <div class="logo-section">
          <a routerLink="/" class="main-logo" aria-label="OnlineShop home">
            <div class="logo-circle">
              <span class="logo-mark">O</span>
            </div>
            <div class="brand-name">
              <span class="brand-name-top">Online</span>
              <span class="brand-name-bottom">Shop</span>
            </div>
          </a>
        </div>

        <!-- Nav -->
        <nav class="nav-bar">
          <ul class="nav-links">
            <li><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Home</a></li>
            <li><a routerLink="/products" routerLinkActive="active">Catalog</a></li>
            <li><a routerLink="/categories" routerLinkActive="active">Categories</a></li>
            <li><a routerLink="/about" routerLinkActive="active">About</a></li>
            <li *ngIf="isLoggedIn()"><a routerLink="/orders" routerLinkActive="active">My Orders</a></li>
            <li *ngIf="isLoggedIn()"><a routerLink="/profile" routerLinkActive="active">My Profile</a></li>
            <li *ngIf="isSeller()"><a routerLink="/sell" routerLinkActive="active" class="sell-nav-item">Sell Product</a></li>
            <li *ngIf="isOperationsStaff()"><a routerLink="/management" routerLinkActive="active">Operations</a></li>
          </ul>
        </nav>

        <!-- Tools -->
        <div class="header-tools">
          <form (ngSubmit)="onSearch()" class="compact-search">
            <input type="text" name="searchQuery" [(ngModel)]="searchQuery" placeholder="Search">
            <button type="submit"><i class="fas fa-search"></i></button>
          </form>
          
          <div class="user-actions">
            <a routerLink="/cart" class="tool-icon cart">
              <i class="fas fa-shopping-bag"></i>
              <span class="count">{{cartCount}}</span>
            </a>
            <div class="auth-box">
              <ng-container *ngIf="!isLoggedIn()">
                <a routerLink="/login" class="login-link">Login</a>
                <a routerLink="/register" class="reg-link">Join</a>
              </ng-container>
              <ng-container *ngIf="isLoggedIn()">
                <a (click)="logout()" class="logout-icon"><i class="fas fa-power-off"></i></a>
              </ng-container>
            </div>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header { 
      background: white; 
      width: 100%; 
      position: sticky; 
      top: 0; 
      z-index: 1000; 
      box-shadow: 0 1px 15px rgba(0,0,0,0.05); 
      height: 90px;
      display: flex;
      align-items: center;
      overflow: visible;
    }
    
    .header-wrap { display: flex; align-items: center; justify-content: space-between; gap: 30px; width: 100%; }

    .logo-section { display: flex; align-items: center; gap: 20px; }

    .main-logo {
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-circle { 
      width: 62px; 
      height: 62px; 
      border-radius: 50%; 
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--secondary), var(--primary));
      color: white;
      font-weight: 800;
      font-size: 1.5rem;
      box-shadow: 0 6px 16px rgba(17, 24, 39, 0.12);
      transition: 0.3s;
    }
    .logo-circle:hover { transform: scale(1.05); }

    .brand-name {
      display: flex;
      flex-direction: column;
      line-height: 1;
      color: var(--secondary);
    }
    .brand-name-top,
    .brand-name-bottom {
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      font-size: 0.8rem;
    }
    .brand-name-bottom {
      color: var(--primary);
    }

    .nav-bar { flex: 1; }
    .nav-links { display: flex; gap: 20px; list-style: none; margin: 0; padding: 0; }
    .nav-links a { color: #333; font-weight: 700; text-decoration: none; font-size: 0.85rem; text-transform: uppercase; }
    .nav-links a:hover, .nav-links a.active { color: var(--primary); }

    .header-tools { display: flex; align-items: center; gap: 20px; }
    .compact-search { background: #f1f3f5; border-radius: 8px; padding: 0 12px; display: flex; align-items: center; height: 38px; }
    .compact-search input { border: none; background: transparent; outline: none; font-size: 0.85rem; width: 150px; }
    .compact-search button { border: none; background: transparent; color: #888; cursor: pointer; }
    
    .user-actions { display: flex; align-items: center; gap: 15px; }
    .tool-icon { font-size: 1.4rem; color: #333; position: relative; text-decoration: none; }
    .cart .count { position: absolute; top: -5px; right: -5px; background: var(--primary); color: white; font-size: 0.6rem; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; }

    .auth-box { display: flex; gap: 12px; align-items: center; }
    .reg-link { background: #222; color: white !important; padding: 6px 16px; border-radius: 8px; font-weight: 700; text-decoration: none; font-size: 0.85rem; }
    .sell-nav-item { color: var(--primary) !important; border: 1px solid var(--primary); padding: 5px 12px; border-radius: 6px; }
  `]
})
export class HeaderComponent implements OnInit {
  searchQuery: string = '';
  cartCount: number = 0;
  user: any = null;
  private cdr = inject(ChangeDetectorRef);

  constructor(private authService: AuthService, private cart: CartService) {}

  ngOnInit() {
    this.cart.cartCount$.subscribe(count => {
      this.cartCount = count;
      this.cdr.detectChanges();
    });
    if (this.isLoggedIn()) {
      this.authService.getUserProfile().subscribe(user => {
        this.user = user;
        this.cdr.detectChanges();
      });
    }
  }

  isLoggedIn() { return this.authService.isLoggedIn(); }
  isSeller() { 
    const u = this.user || this.authService.getCurrentUser();
    return u?.role === 'seller' || u?.role === '"seller"'; 
  }
  isOperationsStaff() {
    const u = this.user || this.authService.getCurrentUser();
    return ['manager', 'warehouse'].includes(u?.role);
  }
  onSearch() { console.log('Searching for:', this.searchQuery); }
  logout() { this.authService.logout(); window.location.reload(); }
}
