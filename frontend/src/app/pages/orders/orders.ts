import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  template: `
    <main class="orders-page container">
      <h1>My Orders</h1>
      <p *ngIf="message" class="message">{{message}}</p>
      <p class="demo-note">Payments are simulated for this demo. No card details are collected or charged.</p>
      <article class="order-card" *ngFor="let order of orders">
        <div class="order-heading">
          <h2>Order #{{order.id}}</h2>
          <span>{{order.status}}</span>
        </div>
        <p>{{order.order_date | date:'medium'}} · {{order.delivery_address}}</p>
        <div class="order-line" *ngFor="let item of order.items">
          <span>{{item.product_name}} × {{item.quantity}}</span>
          <span>{{item.unit_price * item.quantity | number:'1.2-2'}} KZT</span>
        </div>
        <div class="order-footer">
          <span>{{paymentLabel(order.payment?.method)}} · {{order.payment?.status}}</span>
          <strong>{{order.total_amount | number:'1.2-2'}} KZT</strong>
        </div>
        <button *ngIf="order.status === 'New'" class="btn btn-outline" (click)="cancel(order)">
          Cancel order
        </button>
      </article>
      <p *ngIf="!loading && orders.length === 0">You have not placed any orders yet.</p>
    </main>
  `,
  styles: [`
    .orders-page { padding: 48px 0; }
    .demo-note { color: var(--text-light); margin-bottom: 24px; }
    .order-card { background: white; border: 1px solid var(--border); border-radius: 14px; padding: 22px; margin: 18px 0; }
    .order-heading, .order-line, .order-footer { display: flex; justify-content: space-between; gap: 16px; }
    .order-heading { align-items: center; }
    .order-heading h2 { font-size: 1.2rem; }
    .order-line { padding: 10px 0; border-top: 1px solid var(--border); }
    .order-footer { border-top: 1px solid var(--border); margin-top: 8px; padding-top: 14px; }
    .order-card button { margin-top: 16px; }
    .message { color: var(--primary); }
  `]
})
export class OrdersComponent implements OnInit {
  orders: any[] = [];
  loading = true;
  message = '';

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (!this.auth.isLoggedIn()) {
      this.loading = false;
      this.message = 'Please sign in to view your orders.';
      return;
    }
    this.loadOrders();
  }

  cancel(order: any) {
    this.api.cancelOrder(order.id).subscribe({
      next: () => {
        this.message = `Order #${order.id} cancelled and stock returned.`;
        this.loadOrders();
        this.cdr.detectChanges();
      },
      error: err => {
        this.message = err.error?.detail || 'Could not cancel this order.';
        this.cdr.detectChanges();
      }
    });
  }

  paymentLabel(method?: string): string {
    const labels: Record<string, string> = {
      card: 'Card',
      bank_transfer: 'Bank transfer',
      cash_on_delivery: 'Cash on delivery'
    };
    return method ? labels[method] || method : 'Payment';
  }

  private loadOrders() {
    this.api.getUserOrders().subscribe({
      next: rows => {
        this.orders = Array.isArray(rows) ? rows : rows.results || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: err => {
        this.message = err.error?.detail || 'Could not load your orders.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
