import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { User } from '@models/user.models';
import { NotificationService } from '@services/notification.service';
import { UsersService } from '@services/users.service';
import { materialImports } from '@shared/material/material.imports';

@Component({
  selector: 'app-profile',
  imports: [DatePipe, ...materialImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  private readonly usersService = inject(UsersService);
  private readonly notify = inject(NotificationService);

  readonly user = signal<User | null>(null);
  readonly loading = signal(true);

  constructor() {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.usersService.getProfile().subscribe({
      next: (user) => {
        this.user.set(user);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notify.error('No se pudo cargar el perfil');
      },
    });
  }
}
