import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: any[] = [];
  private cartCountSubject = new BehaviorSubject<number>(0);
  
  cartCount$ = this.cartCountSubject.asObservable();

  constructor() {
    this.loadCart();
  }

  addToCart(product: any) {
    const existing = this.cartItems.find(item => item.id === product.id);
    const stock = Number(product.stock_qty);
    const currentQuantity = existing?.quantity || 0;
    if (Number.isFinite(stock) && currentQuantity >= stock) return false;

    if (existing) {
      existing.quantity += 1;
    } else {
      this.cartItems.push({ ...product, quantity: 1 });
    }
    this.saveCart();
    return true;
  }

  getCartItems() {
    return this.cartItems;
  }

  removeFromCart(productId: number) {
    this.cartItems = this.cartItems.filter(item => item.id !== productId);
    this.saveCart();
  }

  private saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.cartItems));
    this.cartCountSubject.next(this.getTotalCount());
  }

  private loadCart() {
    const saved = localStorage.getItem('cart');
    if (saved) {
      this.cartItems = JSON.parse(saved);
      this.cartCountSubject.next(this.getTotalCount());
    }
  }

  private getTotalCount() {
    return this.cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }

  clearCart() {
    this.cartItems = [];
    this.saveCart();
  }
}
