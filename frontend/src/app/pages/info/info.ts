import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-info',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="info-page container">
      <div class="content-wrapper fade-in">
        <h1 class="page-title">{{content.title}}</h1>
        <div class="info-body" [innerHTML]="content.body"></div>
        
        <div class="faq-list" *ngIf="content.faqs">
          <div class="faq-item" *ngFor="let faq of content.faqs">
             <h3>{{faq.q}}</h3>
             <p>{{faq.a}}</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .info-page { padding: 80px 0; min-height: 70vh; }
    .content-wrapper { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 16px; box-shadow: var(--shadow); }
    .page-title { font-size: 2.5rem; color: var(--secondary); margin-bottom: 30px; font-weight: 700; border-bottom: 2px solid var(--primary); display: inline-block; padding-bottom: 10px; }
    .info-body { line-height: 1.8; color: var(--text); font-size: 1.1rem; }
    .info-body ::ng-deep p { margin-bottom: 20px; }
    .info-body ::ng-deep ul { margin-bottom: 20px; padding-left: 20px; }
    .info-body ::ng-deep li { margin-bottom: 10px; }
    .faq-list { margin-top: 40px; }
    .faq-item { border-bottom: 1px solid var(--border); padding: 20px 0; }
    .faq-item h3 { font-size: 1.2rem; color: var(--primary); margin-bottom: 10px; }
    .faq-item p { color: var(--text-light); }
  `]
})
export class InfoComponent implements OnInit {
  content: any = { title: 'Loading...', body: '' };

  constructor(private route: ActivatedRoute, private titleService: Title) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const type = params['type'];
      this.loadContent(type);
    });
  }

  loadContent(type: string) {
    const data: any = {
      'how-to-order': {
        title: 'How to Order',
        body: `
          <p>Ordering at OnlineShop is simple and fast. Just follow these steps:</p>
          <ul>
            <li>Browse our catalog and add items to your cart.</li>
            <li>Proceed to checkout and enter your delivery details.</li>
            <li>Select your preferred payment method.</li>
            <li>Review and confirm your order.</li>
          </ul>
          <p>You will receive an email confirmation once your order is placed.</p>
        `
      },
      'delivery-payment': {
        title: 'Delivery & Payment',
        body: `
          <p>We offer fast delivery across all cities in Kazakhstan.</p>
          <p><strong>Delivery options:</strong> Standard (2-3 days) and Express (Same day in Almaty).</p>
          <p><strong>Payment methods:</strong> Credit/Debit Cards, Kaspi.kz, and Cash on delivery.</p>
        `
      },
      'returns': {
        title: 'Returns & Refunds',
        body: `
          <p>If you are not satisfied with your purchase, you can return it within 14 days of delivery.</p>
          <p>The items must be in their original packaging and condition.</p>
          <p>Refunds are processed within 5-7 business days after we receive the returned items.</p>
        `
      },
      'faq': {
        title: 'Frequently Asked Questions',
        body: '<p>Find answers to the most common questions below.</p>',
        faqs: [
          { q: 'Is shipping free?', a: 'Yes, for orders above 20,000 KZT!' },
          { q: 'Can I track my order?', a: 'Yes, you will receive a tracking number via SMS.' },
          { q: 'Do you ship internationally?', a: 'Currently, we only ship within Kazakhstan.' }
        ]
      },
      'about-us': { title: 'About OnlineShop', body: '<p>OnlineShop is the leading premium electronics marketplace, offering style, value and trusted service.</p>' },
      'contacts': { title: 'Contact Us', body: '<p>Email: support@onlineshop.kz<br>Phone: +7 700 123 45 67</p>' },
      'careers': { title: 'Join Our Team', body: '<p>We are always looking for talented developers and managers.</p>' },
      'partners': { title: 'Partner Program', body: '<p>Join our affiliate network and earn commissions.</p>' }
    };

    const selected = data[type] || { title: 'Page Not Found', body: '<p>Sorry, the page you are looking for does not exist.</p>' };
    this.content = selected;
    this.titleService.setTitle(`OnlineShop | ${selected.title}`);
  }
}
