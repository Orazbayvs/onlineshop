import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="categories-page container fade-in">
      <h1 class="page-title">Explore Categories</h1>
      <p class="subtitle">Find exactly what you are looking for</p>
      
      <div class="grid grid-cols-4">
        <div class="cat-card" *ngFor="let cat of categories" [routerLink]="['/products']" [queryParams]="{category: cat.id}">
          <div class="cat-icon-lg">
             <i class="fas fa-th-large" *ngIf="!cat.icon"></i>
             <i [class]="cat.icon" *ngIf="cat.icon"></i>
          </div>
          <h3>{{cat.name}}</h3>
          <p>{{cat.description}}</p>
          <span>View Products <i class="fas fa-arrow-right"></i></span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .categories-page { padding: 80px 0; }
    .page-title { font-size: 2.5rem; text-align: center; margin-bottom: 10px; font-weight: 700; color: var(--secondary); }
    .subtitle { text-align: center; color: var(--text-light); margin-bottom: 60px; font-size: 1.1rem; }
    
    .cat-card {
      background: white;
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 40px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      transition: var(--transition);
      cursor: pointer;
    }

    .cat-card:hover {
      box-shadow: var(--shadow-hover);
      transform: translateY(-5px);
      border-color: var(--primary);
    }

    .cat-icon-lg {
      width: 80px;
      height: 80px;
      background: var(--bg-offset);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      color: var(--primary);
      margin-bottom: 25px;
      transition: var(--transition);
    }

    .cat-card:hover .cat-icon-lg {
      background: var(--primary);
      color: white;
    }

    .cat-card h3 { font-size: 1.25rem; margin-bottom: 15px; font-weight: 600; }
    .cat-card p { color: var(--text-light); text-align: center; margin: 0 0 14px; }
    .cat-card span { font-size: 0.9rem; color: var(--primary); font-weight: 600; opacity: 0; transition: var(--transition); }
    .cat-card:hover span { opacity: 1; }
  `]
})
export class CategoriesComponent implements OnInit {
  categories: any[] = [];
  private cdr = inject(ChangeDetectorRef);

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getCategories().subscribe({
      next: (res: any) => {
        this.categories = res && res.results ? res.results : (Array.isArray(res) ? res : []);
        
        // Add some icons if missing
        const icons = [
          'fas fa-laptop',         // Electronics
          'fas fa-tshirt',         // Clothing
          'fas fa-home',           // Home & Garden
          'fas fa-shopping-basket', // Groceries (было fa-headphones)
          'fas fa-robot'           // Toys (было fa-pump-soap)
        ];
        this.categories.forEach((c, i) => {
          if (!c.icon) c.icon = icons[i % icons.length];
        });
        
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading categories:', err)
    });
  }
}
