import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { NotificationService } from '@services/notification.service';
import { materialImports } from '@shared/material/material.imports';
import { getApiErrorMessage } from '@shared/utils/http-error';
import { MyValidators } from '@shared/utils/validators';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, ...materialImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly notify = inject(NotificationService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly hidePassword = signal(true);

  readonly form = this.fb.nonNullable.group(
    {
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: MyValidators.matchPasswords },
  );

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { username, email, password } = this.form.getRawValue();
    this.loading.set(true);
    this.auth.register({ username, email, password }).subscribe({
      next: () => {
        this.loading.set(false);
        this.notify.success('Cuenta creada correctamente');
        this.router.navigate(['/panel']);
      },
      error: (err) => {
        this.loading.set(false);
        this.notify.error(getApiErrorMessage(err, 'No se pudo crear la cuenta'));
      },
    });
  }
}
