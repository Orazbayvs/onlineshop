import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <main class="management-page container">
      <h1>Store operations</h1>
      <p *ngIf="message" class="message">{{message}}</p>

      <ng-container *ngIf="role === 'manager' || role === 'warehouse'; else noAccess">
        <section *ngIf="role === 'manager'">
          <h2>Top-selling products · last 30 days</h2>
          <p *ngIf="report.length === 0">No paid, shipped, or delivered orders in the last 30 days.</p>
          <div class="table-wrap" *ngIf="report.length">
            <table>
              <thead><tr><th>Product</th><th>Units sold</th><th>Revenue</th><th>Stock left</th><th>Suggested action</th></tr></thead>
              <tbody>
                <tr *ngFor="let row of report">
                  <td>{{row.product_name}}</td>
                  <td>{{row.units_sold}}</td>
                  <td>{{row.revenue | number:'1.2-2'}} KZT</td>
                  <td>{{row.stock_qty}}</td>
                  <td>{{recommendation(row)}}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2>Orders</h2>
          <p *ngIf="orders.length === 0">No orders found.</p>
          <div class="table-wrap" *ngIf="orders.length">
            <table>
              <thead><tr><th>Order</th><th *ngIf="role === 'manager'">Customer ID</th><th>Date</th><th>Delivery address</th><th>Total</th><th>Payment</th><th>Status</th></tr></thead>
              <tbody>
                <tr *ngFor="let order of orders">
                  <td>#{{order.id}}</td>
                  <td *ngIf="role === 'manager'">{{order.customer_id}}</td>
                  <td>{{order.order_date | date:'short'}}</td>
                  <td>{{order.delivery_address}}</td>
                  <td>{{order.total_amount | number:'1.2-2'}} KZT</td>
                  <td>{{paymentLabel(order.payment?.method)}} · {{order.payment?.status || 'restricted'}}</td>
                  <td>
                    <select *ngIf="role === 'manager'; else readOnlyStatus"
                            [ngModel]="order.status" (ngModelChange)="changeOrderStatus(order, $event)">
                      <option [value]="order.status">{{order.status}}</option>
                      <option *ngFor="let next of nextStatuses(order)" [value]="next">{{next}}</option>
                    </select>
                    <ng-template #readOnlyStatus>{{order.status}}</ng-template>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section *ngIf="role === 'warehouse'">
          <h2>Warehouse stock</h2>
          <div class="table-wrap" *ngIf="products.length">
            <table>
              <thead><tr><th>Product</th><th>SKU</th><th>In stock</th><th>Update</th></tr></thead>
              <tbody>
                <tr *ngFor="let product of products">
                  <td>{{product.name}}</td>
                  <td>{{product.sku}}</td>
                  <td><input type="number" min="0" step="1" [(ngModel)]="product.stock_qty"></td>
                  <td><button class="btn btn-primary" (click)="saveStock(product)">Save</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </ng-container>
      <ng-template #noAccess>
        <p>Sign in with a manager or warehouse account to access store operations.</p>
      </ng-template>
    </main>
  `,
  styles: [`
    .management-page { padding: 48px 0; }
    h1 { margin-bottom: 30px; }
    section { margin: 32px 0; background: white; padding: 24px; border-radius: 14px; box-shadow: var(--shadow); }
    h2 { margin: 0 0 18px; font-size: 1.25rem; }
    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 12px; border-bottom: 1px solid var(--border); text-align: left; }
    th { color: var(--text-light); font-size: .85rem; }
    td input, td select { padding: 8px; border: 1px solid var(--border); border-radius: 6px; }
    .message { color: var(--primary); }
  `]
})
export class ManagementComponent implements OnInit {
  role = '';
  report: any[] = [];
  orders: any[] = [];
  products: any[] = [];
  message = '';

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (!this.auth.isLoggedIn()) return;
    this.auth.getUserProfile().subscribe({
      next: user => {
        this.role = user.role;
        if (this.role === 'manager') this.loadReport();
        if (this.role === 'manager' || this.role === 'warehouse') this.loadOrders();
        if (this.role === 'warehouse') this.loadProducts();
        this.cdr.detectChanges();
      },
      error: () => {
        this.message = 'Please sign in with a store operations account.';
        this.cdr.detectChanges();
      }
    });
  }

  nextStatuses(order: any): string[] {
    const transitions: Record<string, string[]> = {
      New: order.payment?.method === 'cash_on_delivery' ? ['Paid', 'Shipped', 'Cancelled'] : ['Paid', 'Cancelled'],
      Paid: ['Shipped', 'Cancelled'],
      Shipped: ['Delivered'],
      Delivered: [],
      Cancelled: []
    };
    return transitions[order.status] || [];
  }

  paymentLabel(method?: string): string {
    const labels: Record<string, string> = {
      card: 'Card',
      bank_transfer: 'Bank transfer',
      cash_on_delivery: 'Cash on delivery'
    };
    return method ? labels[method] || method : 'Payment';
  }

  recommendation(row: any): string {
    if (row.stock_qty <= 2) return 'Reorder stock';
    if (row.units_sold <= 2 && Number(row.revenue) >= 20000) return 'Consider promotion';
    return 'Monitor';
  }

  changeOrderStatus(order: any, newStatus: string) {
    this.api.updateOrderStatus(order.id, newStatus).subscribe({
      next: () => {
        this.message = `Order #${order.id} updated.`;
        this.loadOrders();
        this.loadReport();
        this.cdr.detectChanges();
      },
      error: err => {
        this.message = err.error?.status?.[0] || err.error?.detail || 'Could not update order status.';
        this.loadOrders();
        this.cdr.detectChanges();
      }
    });
  }

  saveStock(product: any) {
    this.api.updateStock(product.id, Number(product.stock_qty)).subscribe({
      next: updated => {
        product.stock_qty = updated.stock_qty;
        this.message = `Stock updated for ${product.name}.`;
        this.cdr.detectChanges();
      },
      error: err => {
        this.message = err.error?.stock_qty?.[0] || 'Could not update stock.';
        this.cdr.detectChanges();
      }
    });
  }

  private loadReport() {
    this.api.getSalesReport().subscribe({
      next: rows => {
        this.report = rows;
        this.cdr.detectChanges();
      },
      error: err => {
        this.message = err.error?.detail || 'Could not load sales report.';
        this.cdr.detectChanges();
      }
    });
  }

  private loadOrders() {
    this.api.getUserOrders().subscribe({
      next: rows => {
        this.orders = Array.isArray(rows) ? rows : rows.results || [];
        this.cdr.detectChanges();
      },
      error: err => {
        this.message = err.error?.detail || 'Could not load orders.';
        this.cdr.detectChanges();
      }
    });
  }

  private loadProducts() {
    this.api.getProducts().subscribe({
      next: rows => {
        this.products = rows.results || rows;
        this.cdr.detectChanges();
      },
      error: err => {
        this.message = err.error?.detail || 'Could not load stock.';
        this.cdr.detectChanges();
      }
    });
  }
}
