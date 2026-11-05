import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sell',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="sell-page container fade-in">
      <div class="form-container">
        <h1>Sell a Product</h1>
        <p>Fill in the details below to list your item on OnlineShop</p>

        <form (ngSubmit)="onSubmit()" #sellForm="ngForm">
          <div class="form-group">
            <label for="name">Product Name</label>
            <input type="text" id="name" name="name" [(ngModel)]="product.name" required placeholder="e.g. Vintage Camera">
          </div>

          <div class="form-group">
            <label for="sku">SKU</label>
            <input type="text" id="sku" name="sku" [(ngModel)]="product.sku" maxlength="30" placeholder="Leave blank to generate automatically">
          </div>

          <div class="form-row">
            <div class="form-group half">
              <label for="price">Price (KZT)</label>
              <input type="number" id="price" name="price" [(ngModel)]="product.price" min="0.01" step="0.01" required>
            </div>
            <div class="form-group half">
              <label for="stock_qty">Quantity in stock</label>
              <input type="number" id="stock_qty" name="stock_qty" [(ngModel)]="product.stock_qty" min="0" step="1" required>
            </div>
          </div>

          <div class="form-group">
            <label for="category">Category</label>
            <select id="category" name="category" [(ngModel)]="product.category" required>
              <option value="" disabled selected>Select a category</option>
              <option *ngFor="let cat of categories" [value]="cat.id">{{cat.name}}</option>
            </select>
          </div>

          <div class="form-group">
            <label for="description">Description</label>
            <textarea id="description" name="description" [(ngModel)]="product.description" required rows="4" placeholder="Describe your product..."></textarea>
          </div>

          <div class="form-group">
            <label for="image_url">Image URL</label>
            <input type="url" id="image_url" name="image_url" [(ngModel)]="product.image_url" placeholder="Paste an image link here">
            <small>If empty, a placeholder will be used.</small>
          </div>

          <button type="submit" class="btn btn-primary btn-lg" [disabled]="!sellForm.form.valid || loading">
            {{ loading ? 'Publishing...' : 'Publish Product' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .sell-page { padding: 80px 0; display: flex; justify-content: center; }
    .form-container { background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); width: 100%; max-width: 600px; box-shadow: 0 10px 40px rgba(0,0,0,0.05); }
    h1 { margin-bottom: 10px; font-weight: 700; color: var(--secondary); text-align: center; }
    p { text-align: center; color: var(--text-light); margin-bottom: 40px; }
    
    .form-group { margin-bottom: 25px; }
    .form-row { display: flex; gap: 20px; }
    .half { flex: 1; }
    
    label { display: block; margin-bottom: 8px; font-weight: 600; color: #444; font-size: 0.9rem; }
    input, select, textarea { width: 100%; padding: 12px 16px; border: 1px solid var(--border); border-radius: 10px; font-family: inherit; font-size: 1rem; transition: var(--transition); background: #fcfcfc; }
    input:focus, select:focus, textarea:focus { outline: none; border-color: var(--primary); background: white; box-shadow: 0 0 0 4px rgba(0, 163, 108, 0.1); }
    
    .btn-lg { width: 100%; padding: 15px; margin-top: 20px; }
    small { display: block; margin-top: 5px; color: #999; }
  `]
})
export class SellComponent implements OnInit {
  product: any = {
    name: '',
    price: 0,
    sku: '',
    stock_qty: 1,
    category: '',
    description: '',
    image_url: ''
  };
  categories: any[] = [];
  loading = false;

  constructor(
    private api: ApiService, 
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.api.getCategories().subscribe(res => {
      this.categories = res && res.results ? res.results : (Array.isArray(res) ? res : []);
    });
  }

  onSubmit() {
    this.loading = true;
    const { sku, ...productData } = this.product;
    const submission = sku ? { ...productData, sku } : productData;
    this.api.createProduct(submission).subscribe({
      next: (res) => {
        alert('Product published successfully!');
        this.router.navigate(['/products']);
      },
      error: (err) => {
        alert('Error publishing product. Please check your data and login status.');
        this.loading = false;
      }
    });
  }
}
