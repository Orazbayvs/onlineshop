import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { timeout } from 'rxjs';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="cart-page container fade-in">
      <h1>Your Shopping Cart</h1>
      
      <div *ngIf="items.length > 0; else emptyCart" class="cart-container">
        <div class="cart-items">
          <div *ngFor="let item of items" class="cart-item">
            <img [src]="item.image_url || fallbackImage" alt="{{item.name}}"
                 (error)="item.image_url = fallbackImage">

            <div class="item-details">
              <h3>{{item.name}}</h3>
              <p class="price">{{item.price | number}} KZT</p>
              <div class="quantity">
                <span>Quantity: {{item.quantity}}</span>
              </div>
            </div>
            <div class="item-actions">
               <button class="btn btn-outline" (click)="removeItem(item)">Remove</button>
            </div>
          </div>
        </div>
        
        <div class="cart-summary">
          <h2>Summary</h2>
          <div class="summary-row">
            <span>Subtotal</span>
            <span>{{total | number}} KZT</span>
          </div>
          <div class="summary-row">
            <span>Delivery</span>
            <span>Free</span>
          </div>
          <hr>
          <div class="summary-row total">
            <span>Total</span>
            <span>{{total | number}} KZT</span>
          </div>
          <label for="delivery-address">Delivery address</label>
          <textarea id="delivery-address" name="deliveryAddress" [(ngModel)]="deliveryAddress"
                    maxlength="200" required placeholder="Street, building, apartment, city"></textarea>
          <label for="payment-method">Payment method</label>
          <select id="payment-method" name="paymentMethod" [(ngModel)]="paymentMethod">
            <option value="card">Card (demo)</option>
            <option value="bank_transfer">Bank transfer (demo)</option>
            <option value="cash_on_delivery">Cash on delivery</option>
          </select>
          <p class="demo-note">Demo checkout only: no money is charged and card details are never collected.</p>
          <p class="checkout-error" *ngIf="checkoutError">{{checkoutError}}</p>
          <button class="btn btn-primary btn-lg" (click)="checkout()" [disabled]="submitting || !deliveryAddress.trim()">
            {{submitting ? 'Placing order...' : 'Place Order'}}
          </button>
        </div>
      </div>
      
      <ng-template #emptyCart>
        <div class="empty-state">
          <i class="fas fa-shopping-basket"></i>
          <p>Your cart is empty. Start shopping!</p>
          <button class="btn btn-primary" routerLink="/products">Go to Catalog</button>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .cart-page { padding: 60px 0; }
    h1 { margin-bottom: 40px; font-weight: 700; color: var(--secondary); }
    
    .cart-container { display: flex; gap: 40px; align-items: flex-start; }
    .cart-items { flex: 2; }
    .cart-summary { flex: 1; background: #f8f9fa; padding: 30px; border-radius: 20px; position: sticky; top: 120px; }
    
    .cart-item { display: flex; gap: 20px; background: white; padding: 20px; border-radius: 16px; margin-bottom: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); align-items: center; }
    .cart-item img { width: 100px; height: 100px; object-fit: cover; border-radius: 12px; }
    .item-details { flex: 1; }
    .item-details h3 { margin-bottom: 5px; font-weight: 600; }
    .price { color: var(--primary); font-weight: 700; font-size: 1.1rem; }
    
    .summary-row { display: flex; justify-content: space-between; margin-bottom: 15px; color: #555; }
    .total { font-weight: 700; font-size: 1.25rem; color: var(--secondary); margin-top: 15px; }
    .btn-lg { width: 100%; margin-top: 25px; }
    .cart-summary label { display: block; margin: 18px 0 7px; font-weight: 600; }
    .cart-summary textarea, .cart-summary select { width: 100%; padding: 11px; border: 1px solid var(--border); border-radius: 8px; font: inherit; }
    .demo-note { margin-top: 12px; color: var(--text-light); font-size: 0.8rem; }
    .checkout-error { color: #b91c1c; margin-top: 12px; }
    
    .empty-state { text-align: center; padding: 100px 0; }
    .empty-state i { font-size: 4rem; color: #ddd; margin-bottom: 20px; }
    .empty-state p { color: var(--text-light); margin-bottom: 30px; }
  `]
})
export class CartComponent implements OnInit {
  items: any[] = [];
  total: number = 0;
  deliveryAddress = '';
  paymentMethod = 'card';
  checkoutError = '';
  submitting = false;
  fallbackImage = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800';

  constructor(
    private cart: CartService,
    private api: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadCart();
  }

  loadCart() {
    this.items = this.cart.getCartItems();
    this.calculateTotal();
  }

  calculateTotal() {
    this.total = this.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }

  removeItem(item: any) {
    this.cart.removeFromCart(item.id);
    this.loadCart();
  }

  checkout() {
    if (this.items.length === 0 || !this.deliveryAddress.trim() || this.submitting) return;
    
    const orderData = {
      delivery_address: this.deliveryAddress.trim(),
      payment_method: this.paymentMethod,
      items: this.items.map(item => ({ product: item.id, quantity: item.quantity || 1 }))
    };

    this.checkoutError = '';
    this.submitting = true;
    this.api.createOrder(orderData).pipe(timeout({ first: 15000 })).subscribe({
      next: (res) => {
        this.submitting = false;
        alert(`Order #${res.id} placed. Payment is pending in demo mode.`);
        this.cart.clearCart();
        this.cdr.detectChanges();
        this.router.navigate(['/orders']);
      },
      error: (err) => {
        this.submitting = false;
        if (err.name === 'TimeoutError') {
          this.checkoutError = 'The server did not respond in time. Check My Orders before trying again to avoid placing a duplicate order.';
          this.cdr.detectChanges();
          return;
        }

        const detail = this.formatError(err.error);
        this.checkoutError = detail || (err.status === 0
          ? 'Could not reach the server. Check your connection and try again.'
          : 'Could not place order. Check your account, stock, address, and payment method.');
        this.cdr.detectChanges();
      }
    });
  }

  private formatError(value: unknown): string {
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) return value.map(item => this.formatError(item)).filter(Boolean).join(' ');
    if (value && typeof value === 'object') {
      return Object.values(value).map(item => this.formatError(item)).filter(Boolean).join(' ');
    }
    return '';
  }
}
