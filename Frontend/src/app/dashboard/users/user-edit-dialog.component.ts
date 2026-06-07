import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ROLES, UpdateUserPayload, User } from '@models/user.models';
import { materialImports } from '@shared/material/material.imports';

@Component({
  selector: 'app-user-edit-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, ...materialImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title>Editar usuario</h2>
    <mat-dialog-content>
      <form class="form" [formGroup]="form">
        <mat-form-field appearance="outline">
          <mat-label>Usuario</mat-label>
          <input matInput formControlName="username" />
          @if (form.controls.username.hasError('required')) {
            <mat-error>Obligatorio</mat-error>
          }
          @if (form.controls.username.hasError('minlength')) {
            <mat-error>Mínimo 3 caracteres</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Email</mat-label>
          <input matInput type="email" formControlName="email" />
          @if (form.controls.email.hasError('email')) {
            <mat-error>Email no válido</mat-error>
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
      <button mat-flat-button color="primary" (click)="save()">Guardar</button>
    </mat-dialog-actions>
  `,
  styles: `
    .form {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      min-width: 320px;
      padding-top: 0.5rem;
    }
  `,
})
export class UserEditDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject<MatDialogRef<UserEditDialogComponent, UpdateUserPayload>>(
    MatDialogRef,
  );
  private readonly user = inject<User>(MAT_DIALOG_DATA);

  readonly roles = ROLES;
  readonly form = this.fb.nonNullable.group({
    username: [this.user.username, [Validators.required, Validators.minLength(3)]],
    email: [this.user.email, [Validators.required, Validators.email]],
    roles: [this.user.roles, [Validators.required]],
  });

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.dialogRef.close(this.form.getRawValue());
  }
}
