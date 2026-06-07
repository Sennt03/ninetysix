import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { materialImports } from '@shared/material/material.imports';

@Component({
  selector: 'app-home',
  imports: [RouterLink, ...materialImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private readonly auth = inject(AuthService);
  readonly user = this.auth.user;
  readonly isAdmin = this.auth.isAdmin;
}
