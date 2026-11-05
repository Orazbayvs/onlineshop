import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <footer class="footer">
      <div class="container footer-grid">
        <div class="footer-info">
          <a routerLink="/" class="logo footer-brand">
            <span class="footer-brand-mark">O</span>
            <span class="footer-brand-text">OnlineShop</span>
          </a>
          <p>Premium electronics, accessories and smart tech for everyday life.</p>
          <div class="social-links">
            <a href="https://facebook.com" target="_blank"><i class="fab fa-facebook-f"></i></a>
            <a href="https://instagram.com" target="_blank"><i class="fab fa-instagram"></i></a>
            <a href="https://t.me" target="_blank"><i class="fab fa-telegram-plane"></i></a>
          </div>
        </div>

        <div class="footer-links" *ngFor="let section of footerLinks">
          <h4>{{section.title}}</h4>
          <ul>
            <li *ngFor="let link of section.links">
              <a [routerLink]="['/info', link.type]" target="_blank">{{link.name}}</a>
            </li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <div class="container">
          <p>&copy; 2026 OnlineShop. All rights reserved.</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer { background: var(--secondary); color: white; padding-top: 80px; }
    .footer-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 50px; margin-bottom: 60px; }
    .footer-brand {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 25px;
    }
    .footer-brand-mark {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--primary), #d6b58d);
      color: var(--secondary);
      font-weight: 800;
    }
    .footer-brand-text {
      font-size: 1.2rem;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: white;
    }
    .social-links { display: flex; gap: 15px; }
    .social-links a { width: 40px; height: 40px; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; border-radius: 50%; color: white; transition: var(--transition); }
    .social-links a:hover { background: var(--primary); transform: translateY(-3px); }
    .footer-links h4, .footer-contact h4 { font-size: 1.2rem; margin-bottom: 25px; font-weight: 600; }
    .footer-links ul li { margin-bottom: 12px; }
    .footer-links ul li a { opacity: 0.7; }
    .footer-links ul li a:hover { opacity: 1; color: var(--primary); padding-left: 5px; }
    .subscribe-box { display: flex; gap: 10px; }
    .subscribe-box input { flex: 1; padding: 12px; border-radius: var(--radius); border: none; font-family: inherit; }
    .footer-bottom { border-top: 1px solid rgba(255,255,255,0.1); padding: 30px 0; text-align: center; }
  `]
})
export class FooterComponent {
  footerLinks = [
    { 
      title: 'Customers', 
      links: [
        { name: 'How to Order', type: 'how-to-order' },
        { name: 'Delivery & Payment', type: 'delivery-payment' },
        { name: 'Returns', type: 'returns' },
        { name: 'FAQ', type: 'faq' }
      ] 
    },
    { 
      title: 'Company', 
      links: [
        { name: 'About Us', type: 'about-us' },
        { name: 'Contacts', type: 'contacts' },
        { name: 'Careers', type: 'careers' },
        { name: 'Partners', type: 'partners' }
      ] 
    }
  ];
}
