import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="home">
      <!-- Hero Section -->
      <section class="hero">
        <div class="container hero-container">
          <div class="hero-content fade-in">
            <span class="badge">Premium Tech Store</span>
            <h1>Discover smart living with <span>OnlineShop</span></h1>
            <p>Curated gadgets, premium electronics and accessories for work, lifestyle and entertainment.</p>
            <div class="hero-btns">
              <a routerLink="/products" class="btn btn-primary">Shop now <i class="fas fa-arrow-right"></i></a>
              <a routerLink="/register" class="btn btn-outline" *ngIf="!isLoggedIn()">Become a seller</a>
            </div>
          </div>
          <div class="hero-image fade-in">
            <img src="assets/images/hero.png" alt="OnlineShop Hero" onerror="this.src='https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1000'">
          </div>
        </div>
      </section>

      <section class="categories container">
        <h2 class="section-title">Featured collections</h2>
        <div class="category-grid">
          <div class="category-card">
            <i class="fas fa-mobile-alt"></i>
            <h3>Smartphones</h3>
            <p>Top brands and flagship devices.</p>
          </div>
          <div class="category-card">
            <i class="fas fa-laptop"></i>
            <h3>Laptops</h3>
            <p>Power for work, study and gaming.</p>
          </div>
          <div class="category-card">
            <i class="fas fa-headphones"></i>
            <h3>Audio</h3>
            <p>Immersive sound and wireless comfort.</p>
          </div>
          <div class="category-card">
            <i class="fas fa-gamepad"></i>
            <h3>Gaming</h3>
            <p>Gear for the next-level setup.</p>
          </div>
        </div>
      </section>

      <section class="partners container">
        <h2 class="section-title">Trusted by modern shoppers</h2>
        <div class="partner-logos">
          <div class="partner-item partner-item--text">
            <span>Fast delivery</span>
            <span>Premium support</span>
            <span>Secure checkout</span>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .home { min-height: 100vh; }
    .hero {
      background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%);
      padding: 80px 0;
      overflow: hidden;
    }

    .hero-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      align-items: center;
      gap: 50px;
    }

    .hero-content h1 {
      font-size: 3.5rem;
      line-height: 1.1;
      margin: 20px 0;
      font-weight: 800;
    }

    .hero-content h1 span {
      color: var(--primary);
    }

    .hero-content p {
      font-size: 1.1rem;
      color: var(--text-light);
      margin-bottom: 35px;
      max-width: 500px;
    }

    .hero-content .badge {
      background: rgba(0, 137, 208, 0.1);
      color: var(--primary);
      padding: 6px 15px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .hero-btns {
      display: flex;
      gap: 15px;
    }

    .btn-outline {
      border: 1px solid var(--border);
      background: white;
    }

    .hero-image img {
      width: 100%;
      border-radius: 24px;
      box-shadow: 20px 20px 60px rgba(0,0,0,0.08);
      max-height: 500px;
      object-fit: cover;
    }

    .category-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 24px;
      margin-top: 40px;
    }

    .category-card {
      background: linear-gradient(180deg, #ffffff 0%, #f8f1ea 100%);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 32px 24px;
      text-align: center;
      box-shadow: var(--shadow);
      transition: var(--transition);
    }

    .category-card:hover {
      transform: translateY(-6px);
      box-shadow: var(--shadow-hover);
    }

    .category-card i {
      font-size: 2.1rem;
      color: var(--primary);
      margin-bottom: 18px;
    }

    .category-card h3 {
      font-size: 1.4rem;
      margin-bottom: 10px;
      color: var(--secondary);
    }

    .category-card p {
      color: var(--text-light);
      font-size: 0.95rem;
    }

    .section-title {
      text-align: center;
      font-size: 2.2rem;
      font-weight: 700;
      margin-bottom: 40px;
    }

    .partners { padding: 80px 0; border-top: 1px solid var(--border); }
    .partner-logos { display: flex; justify-content: center; margin-top: 40px; }
    .partner-item { text-align: center; }
    .partner-item--text {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 18px;
    }
    .partner-item--text span {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: rgba(179, 139, 91, 0.08);
      color: var(--secondary);
      border: 1px solid var(--border);
      border-radius: 999px;
      padding: 12px 18px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      font-size: 0.72rem;
    }
    
    @media (max-width: 768px) {
      .hero-container { grid-template-columns: 1fr; text-align: center; }
      .hero-content h1 { font-size: 2.5rem; }
      .hero-content p { margin-left: auto; margin-right: auto; }
      .hero-btns { justify-content: center; }
    }
  `]
})
export class HomeComponent {
  private authService = inject(AuthService);

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
}
