import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CreateUserPayload, ROLES } from '@models/user.models';
import { materialImports } from '@shared/material/material.imports';

@Component({
  selector: 'app-user-create-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, ...materialImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title>Nuevo usuario</h2>
    <mat-dialog-content>
      <form class="form" [formGroup]="form">
        <mat-form-field appearance="outline">
          <mat-label>Usuario</mat-label>
          <input matInput formControlName="username" autocomplete="off" />
          @if (form.controls.username.hasError('required')) {
            <mat-error>Obligatorio</mat-error>
          }
          @if (form.controls.username.hasError('minlength')) {
            <mat-error>Mínimo 3 caracteres</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Email</mat-label>
          <input matInput type="email" formControlName="email" autocomplete="off" />
          @if (form.controls.email.hasError('required')) {
            <mat-error>Obligatorio</mat-error>
          }
          @if (form.controls.email.hasError('email')) {
            <mat-error>Email no válido</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Contraseña</mat-label>
          <input
            matInput
            [type]="hidePassword() ? 'password' : 'text'"
            formControlName="password"
            autocomplete="new-password"
          />
          <button
            type="button"
            mat-icon-button
            matSuffix
            (click)="hidePassword.set(!hidePassword())"
            [attr.aria-label]="hidePassword() ? 'Mostrar contraseña' : 'Ocultar contraseña'"
          >
            <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
          </button>
          @if (form.controls.password.hasError('required')) {
            <mat-error>Obligatoria</mat-error>
          }
          @if (form.controls.password.hasError('minlength')) {
            <mat-error>Mínimo 8 caracteres</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Roles</mat-label>
          <mat-select formControlName="roles" multiple>
            @for (role of roles; track role) {
              <mat-option [value]="role">{{ role }}</mat-option>
            }
          </mat-select>
          @if (form.controls.roles.hasError('required')) {
            <mat-error>Selecciona al menos un rol</mat-error>
          }
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button color="primary" (click)="save()">Crear usuario</button>
    </mat-dialog-actions>
  `,
  styles: `
    .form {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      min-width: 340px;
      padding-top: 0.5rem;
    }
  `,
})
export class UserCreateDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject<MatDialogRef<UserCreateDialogComponent, CreateUserPayload>>(
    MatDialogRef,
  );

  readonly roles = ROLES;
  readonly hidePassword = signal(true);

  readonly form = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    roles: [['USER'] as CreateUserPayload['roles'], [Validators.required]],
  });

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.dialogRef.close(this.form.getRawValue());
  }
}
