import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = '/api';

  constructor(private http: HttpClient) { }

  getCategories(): Observable<any> {
    return this.http.get(`${this.baseUrl}/categories/`);
  }

  getProducts(params?: any): Observable<any> {
    return this.http.get(`${this.baseUrl}/products/`, { params });
  }

  createProduct(product: any): Observable<any> {
    const token = localStorage.getItem('access_token');
    return this.http.post(`${this.baseUrl}/products/`, product, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  getProduct(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/products/${id}/`);
  }

  getCategoryProducts(categoryId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/categories/${categoryId}/products/`);
  }
  
  createOrder(orderData: any): Observable<any> {
    const token = localStorage.getItem('access_token');
    return this.http.post(`${this.baseUrl}/orders/`, orderData, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  getUserOrders(): Observable<any> {
    const token = localStorage.getItem('access_token');
    return this.http.get(`${this.baseUrl}/orders/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  updateProfile(profile: any): Observable<any> {
    const token = localStorage.getItem('access_token');
    return this.http.patch(`${this.baseUrl}/me/`, profile, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  updateOrderStatus(orderId: number, status: string): Observable<any> {
    const token = localStorage.getItem('access_token');
    return this.http.patch(`${this.baseUrl}/orders/${orderId}/`, { status }, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  cancelOrder(orderId: number): Observable<any> {
    const token = localStorage.getItem('access_token');
    return this.http.delete(`${this.baseUrl}/orders/${orderId}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  getSalesReport(): Observable<any> {
    const token = localStorage.getItem('access_token');
    return this.http.get(`${this.baseUrl}/reports/sales/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  updateStock(productId: number, stock_qty: number): Observable<any> {
    const token = localStorage.getItem('access_token');
    return this.http.patch(`${this.baseUrl}/products/${productId}/stock/`, { stock_qty }, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}
