import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SeoService } from '@services/seo.service';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';
import {
  STORE_CITY,
  STORE_PHONE_DISPLAY,
  STORE_WHATSAPP,
  whatsappLink,
} from '../../shared/store.config';

/** Página "Contacto": datos de contacto + formulario que abre WhatsApp con el
 * mensaje ya armado (nombre, cédula, dirección y mensaje). No usa email. */
@Component({
  selector: 'app-contacto',
  imports: [PageHeaderComponent, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header kicker="— Hablemos" title="Contacto"
      subtitle="¿Tienes preguntas sobre productos, tallas, envíos o quieres hacer un pedido? Escríbenos y te respondemos por WhatsApp." />

    <section class="cn">
      <div class="cn__info">
        <a class="cn__row" [href]="whatsapp" target="_blank" rel="noopener">
          <span class="cn__ic">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3.5 20.5l1.3-4.6A8 8 0 1112 20a8 8 0 01-4-1.1l-4.5 1.6z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
              <path d="M9 8.5c.2 2.5 2 4.3 4.5 4.5.6 0 1.2-.6 1.2-1.2l-1.6-.8-.8.8a4 4 0 01-1.6-1.6l.8-.8-.8-1.6c-.6 0-1.3.6-1.3 1.2z" fill="currentColor" />
            </svg>
          </span>
          <span class="cn__text"><span class="cn__label">WhatsApp</span><span class="cn__value">{{ phone }}</span></span>
        </a>
        <div class="cn__row cn__row--static">
          <span class="cn__ic">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z" stroke="currentColor" stroke-width="1.6" />
              <circle cx="12" cy="10" r="2.4" stroke="currentColor" stroke-width="1.6" />
            </svg>
          </span>
          <span class="cn__text"><span class="cn__label">Ubicación</span><span class="cn__value">{{ city }}</span></span>
        </div>
      </div>

      <div class="cn__card">
        @if (sent()) {
          <div class="cn__done">
            <span class="cn__done-ic" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" /></svg>
            </span>
            <h2 class="cn__done-title">¡Te abrimos WhatsApp!</h2>
            <p class="cn__done-text">Tu mensaje quedó armado y listo. Solo pulsa enviar dentro de WhatsApp para que lo recibamos.</p>
            <button type="button" class="cn__again" (click)="reset()">Escribir otro mensaje</button>
          </div>
        } @else {
          <form class="cn__form" [formGroup]="form" (ngSubmit)="submit()" novalidate>
            <div class="cn__two">
              <label class="cn__field">
                <span class="cn__flabel">Nombre</span>
                <input class="cn__input" type="text" formControlName="name" placeholder="Tu nombre completo" autocomplete="name" />
                @if (invalid('name')) { <span class="cn__err">Ingresa tu nombre.</span> }
              </label>
              <label class="cn__field">
                <span class="cn__flabel">Cédula</span>
                <input class="cn__input" type="text" inputmode="numeric" formControlName="cedula" placeholder="1712345678" autocomplete="off" />
                @if (invalid('cedula')) { <span class="cn__err">Ingresa un número de cédula válido.</span> }
              </label>
            </div>
            <label class="cn__field">
              <span class="cn__flabel">Dirección</span>
              <input class="cn__input" type="text" formControlName="address" placeholder="Calle, número, ciudad…" autocomplete="street-address" />
              @if (invalid('address')) { <span class="cn__err">Ingresa tu dirección.</span> }
            </label>
            <label class="cn__field">
              <span class="cn__flabel">Mensaje</span>
              <textarea class="cn__input cn__textarea" formControlName="message" rows="5" placeholder="Cuéntanos qué necesitas…"></textarea>
              @if (invalid('message')) { <span class="cn__err">Escribe tu mensaje.</span> }
            </label>

            <button type="submit" class="cn__send">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M3.5 20.5l1.3-4.6A8 8 0 1112 20a8 8 0 01-4-1.1l-4.5 1.6z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
              </svg>
              Enviar por WhatsApp
            </button>
          </form>
        }
      </div>
    </section>
  `,
  styleUrl: './contacto.component.scss',
})
export class ContactoComponent {
  private readonly fb = inject(FormBuilder);
  private readonly seo = inject(SeoService);

  readonly whatsapp = STORE_WHATSAPP;
  readonly phone = STORE_PHONE_DISPLAY;
  readonly city = STORE_CITY;

  readonly sent = signal(false);

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    cedula: ['', [Validators.required, Validators.pattern(/^[0-9]{6,13}$/)]],
    address: ['', Validators.required],
    message: ['', Validators.required],
  });

  constructor() {
    this.seo.update({
      title: 'Contacto · Ninetysix',
      description: 'Contáctanos por WhatsApp o desde el formulario. Te respondemos rápido.',
    });
  }

  invalid(ctrl: string): boolean {
    const c = this.form.get(ctrl);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const text = [
      '¡Hola Ninetysix! 👋 Quiero hacer una consulta:',
      '',
      `*Nombre:* ${v.name}`,
      `*Cédula:* ${v.cedula}`,
      `*Dirección:* ${v.address}`,
      '',
      `*Mensaje:* ${v.message}`,
    ].join('\n');

    if (typeof window !== 'undefined') {
      window.open(whatsappLink(text), '_blank');
    }
    this.sent.set(true);
  }

  reset(): void {
    this.sent.set(false);
    this.form.reset();
  }
}
