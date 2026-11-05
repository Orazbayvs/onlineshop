import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="products-page container">
      <div class="page-header">
        <h1>Product Catalog</h1>
        <div class="filters">
           <select [value]="selectedCategoryId" (change)="onCategoryChange($event)">
             <option value="">All Categories</option>
             <option *ngFor="let cat of categories" [value]="cat.id">{{cat.name}}</option>
           </select>
           <select (change)="onSortChange($event)">
              <option value="name">By Name</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
           </select>
        </div>
      </div>

      <div class="grid grid-cols-4" *ngIf="!loading; else loadingTemplate">
        <div class="product-card" *ngFor="let p of products">
          <div class="p-img">
             <img [src]="p.image_url || fallbackImage" alt="{{p.name}}" class="product-image"
                  (error)="p.image_url = fallbackImage">
             <div class="no-img" *ngIf="!p.image_url"><i class="fas fa-image"></i></div>
             <span class="stock-badge" [class.low-stock]="p.stock_qty <= 10" [class.out-of-stock]="p.stock_qty === 0">
               {{ getStockLabel(p.stock_qty) }}
             </span>
          </div>
          <div class="p-info">
             <div class="category-tag">{{ getCategoryName(p.category) }}</div>
             <h3>{{p.name}}</h3>
             <p>{{ (p.description || '') | slice:0:60 }}...</p>
             <div class="stock-row">
               <span class="stock-label">On stock:</span>
               <span class="stock-value">{{ p.stock_qty || 0 }} pcs</span>
             </div>
             <div class="p-bottom">
                <span class="p-price">{{p.price | number}} KZT</span>
                <button class="btn btn-primary btn-sm" (click)="addToCart(p)" [disabled]="p.stock_qty === 0" [attr.aria-label]="'Add ' + p.name + ' to cart'">
                  <i class="fas fa-cart-plus"></i>
                </button>
             </div>
          </div>
        </div>
      </div>

      <ng-template #loadingTemplate>
        <div class="loader">Loading products...</div>
      </ng-template>

      <div class="no-products" *ngIf="!loading && products.length === 0">
        No products found.
      </div>
    </div>
  `,
  styles: [`
    .products-page {
      padding: 40px 0;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 40px;
    }
    .filters {
      display: flex;
      gap: 15px;
    }
    .filters select {
      padding: 10px;
      border-radius: 8px;
      border: 1px solid var(--border);
      font-family: inherit;
    }
    .product-card {
      background: white;
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
      transition: var(--transition);
    }
    .product-card:hover {
      box-shadow: var(--shadow-hover);
      transform: translateY(-5px);
    }
    .p-img {
      height: 220px;
      background: #f1f1f1;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    .product-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .no-img {
      font-size: 3rem;
      color: #ccc;
    }
    .stock-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      background: rgba(21, 128, 61, 0.12);
      color: #166534;
      border: 1px solid rgba(21, 128, 61, 0.2);
      padding: 6px 10px;
      border-radius: 999px;
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .stock-badge.low-stock {
      background: rgba(245, 158, 11, 0.12);
      border-color: rgba(245, 158, 11, 0.25);
      color: #92400e;
    }
    .stock-badge.out-of-stock {
      background: rgba(239, 68, 68, 0.1);
      border-color: rgba(239, 68, 68, 0.2);
      color: #991b1b;
    }
    .p-info {
      padding: 20px;
    }
    .category-tag {
      display: inline-block;
      margin-bottom: 10px;
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-weight: 700;
      color: var(--primary);
      background: rgba(179, 139, 91, 0.1);
      border-radius: 999px;
      padding: 5px 10px;
    }
    .p-info h3 {
      font-size: 1.1rem;
      margin-bottom: 10px;
    }
    .p-info p {
      font-size: 0.9rem;
      color: var(--text-light);
      margin-bottom: 16px;
    }
    .stock-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 18px;
      font-size: 0.82rem;
      color: var(--text-light);
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
      padding: 10px 0;
    }
    .stock-value {
      font-weight: 700;
      color: var(--secondary);
    }
    .p-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .p-price {
      font-weight: 700;
      font-size: 1.2rem;
    }
    .btn-sm {
      padding: 8px 12px;
      min-width: 40px;
    }
    .loader, .no-products {
      text-align: center;
      padding: 100px 0;
      font-size: 1.2rem;
      color: var(--text-light);
    }
  `]
})
export class ProductsComponent implements OnInit {
  products: any[] = [];
  categories: any[] = [];
  loading = true;
  fallbackImage = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800';

  constructor(private api: ApiService, private cart: CartService, private route: ActivatedRoute) {}
  private cdr = inject(ChangeDetectorRef);
  selectedCategoryId: string = '';
  currentFilters: any = {};

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.selectedCategoryId = params['category'] || '';
      this.currentFilters = { ...params };
      this.loadProducts(this.currentFilters);
    });

    this.api.getCategories().subscribe({
      next: (res) => {
        this.categories = res && res.results ? res.results : (Array.isArray(res) ? res : []);
        this.cdr.detectChanges();
      },
      error: (err) => {}
    });
  }

  loadProducts(params?: any) {
    this.loading = true;
    this.api.getProducts(params).subscribe({
      next: (res) => {
        this.products = res && res.results ? res.results : (Array.isArray(res) ? res : []);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onCategoryChange(event: any) {
    const category = event.target.value;
    this.selectedCategoryId = category;
    if (category) {
      this.currentFilters.category = category;
    } else {
      delete this.currentFilters.category;
    }
    this.loadProducts(this.currentFilters);
  }

  onSortChange(event: any) {
    const ordering = event.target.value;
    this.currentFilters.ordering = ordering;
    this.loadProducts(this.currentFilters);
  }

  getCategoryName(category: any): string {
    if (category?.category_name) return category.category_name;
    if (!category) return 'General';
    if (typeof category === 'object') return category.name || 'General';
    const categoryId = Number(category);
    return this.categories.find(item => item.id === categoryId)?.name || 'General';
  }

  getStockLabel(count: number): string {
    if (count === 0) return 'Sold out';
    if (count <= 10) return 'Low stock';
    return 'In stock';
  }

  addToCart(product: any) {
    if (!this.cart.addToCart(product)) {
      alert(`No more ${product.name} units are available in stock.`);
      return;
    }
    alert(`${product.name} added to cart!`);
  }
}
