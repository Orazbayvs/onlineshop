import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <main class="profile-page container">
      <section class="profile-card">
        <h1>My Profile</h1>
        <p *ngIf="message" [class.error]="hasError">{{message}}</p>
        <form *ngIf="profile" (ngSubmit)="save()">
          <label for="first-name">First name</label>
          <input id="first-name" name="firstName" [(ngModel)]="profile.first_name" required maxlength="150">

          <label for="last-name">Last name</label>
          <input id="last-name" name="lastName" [(ngModel)]="profile.last_name" required maxlength="150">

          <label for="email">Email</label>
          <input id="email" name="email" type="email" [(ngModel)]="profile.email" required maxlength="254">

          <label for="phone">Phone (optional)</label>
          <input id="phone" name="phone" type="tel" [(ngModel)]="profile.phone" maxlength="20">

          <label for="address">Address</label>
          <input id="address" name="address" [(ngModel)]="profile.address" required maxlength="200">

          <p class="role-note">Account role: {{profile.role}}. Contact an administrator to change it.</p>
          <button class="btn btn-primary" type="submit" [disabled]="saving">
            {{saving ? 'Saving...' : 'Save changes'}}
          </button>
        </form>
      </section>
    </main>
  `,
  styles: [`
    .profile-page { padding: 48px 0; display: flex; justify-content: center; }
    .profile-card { width: 100%; max-width: 560px; background: white; padding: 30px; border-radius: 14px; box-shadow: var(--shadow); }
    h1 { margin-bottom: 24px; }
    label { display: block; margin: 16px 0 7px; font-weight: 600; }
    input { width: 100%; padding: 11px; border: 1px solid var(--border); border-radius: 8px; font: inherit; }
    .role-note { color: var(--text-light); margin: 16px 0; }
    .error { color: #b91c1c; }
  `]
})
export class ProfileComponent implements OnInit {
  profile: any = null;
  saving = false;
  message = '';
  hasError = false;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (!this.auth.isLoggedIn()) {
      this.hasError = true;
      this.message = 'Please sign in to edit your profile.';
      return;
    }
    this.auth.getUserProfile().subscribe({
      next: profile => {
        this.profile = profile;
        this.cdr.detectChanges();
      },
      error: () => {
        this.hasError = true;
        this.message = 'Could not load your profile.';
        this.cdr.detectChanges();
      }
    });
  }

  save() {
    if (!this.profile || this.saving) return;
    this.saving = true;
    this.hasError = false;
    this.api.updateProfile({
      first_name: this.profile.first_name,
      last_name: this.profile.last_name,
      email: this.profile.email,
      phone: this.profile.phone,
      address: this.profile.address
    }).subscribe({
      next: profile => {
        this.profile = profile;
        localStorage.setItem('user', JSON.stringify(profile));
        this.message = 'Profile updated.';
        this.saving = false;
        this.cdr.detectChanges();
      },
      error: err => {
        const detail = err.error?.email?.[0] || err.error?.address?.[0] || err.error?.detail;
        this.message = detail || 'Could not save your profile.';
        this.hasError = true;
        this.saving = false;
        this.cdr.detectChanges();
      }
    });
  }
}
