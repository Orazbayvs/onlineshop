import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { ProductsComponent } from './pages/products/products';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { InfoComponent } from './pages/info/info';
import { CategoriesComponent } from './pages/categories/categories';
import { CartComponent } from './pages/cart/cart';
import { SellComponent } from './pages/sell/sell';
import { ManagementComponent } from './pages/management/management';
import { OrdersComponent } from './pages/orders/orders';
import { ProfileComponent } from './pages/profile/profile';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'OnlineShop | Home' },
  { path: 'products', component: ProductsComponent, title: 'OnlineShop | Product Catalog' },
  { path: 'categories', component: CategoriesComponent, title: 'OnlineShop | Categories' },
  { path: 'cart', component: CartComponent, title: 'OnlineShop | Shopping Cart' },
  { path: 'sell', component: SellComponent, title: 'OnlineShop | Sell Product' },
  { path: 'management', component: ManagementComponent, title: 'OnlineShop | Store Operations' },
  { path: 'orders', component: OrdersComponent, title: 'OnlineShop | My Orders' },
  { path: 'profile', component: ProfileComponent, title: 'OnlineShop | My Profile' },
  { path: 'login', component: LoginComponent, title: 'OnlineShop | Login' },
  { path: 'register', component: RegisterComponent, title: 'OnlineShop | Registration' },
  { path: 'info/:type', component: InfoComponent, title: 'OnlineShop | Help Center' },
  { path: 'about', redirectTo: 'info/about-us' },
  { path: '**', redirectTo: '' }
];
