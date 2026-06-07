import { AbstractControl, ValidationErrors } from '@angular/forms';

export class MyValidators {
  /** Valida que `password` y `confirmPassword` coincidan (a nivel de grupo). */
  static matchPasswords(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    if (!confirmPassword) {
      return null;
    }
    return password === confirmPassword ? null : { passwordMismatch: true };
  }
}
