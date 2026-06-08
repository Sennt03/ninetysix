import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SeoService } from '@services/seo.service';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';
import {
  STORE_CITY,
  STORE_EMAIL,
  STORE_PHONE_DISPLAY,
  STORE_WHATSAPP,
} from '../../shared/store.config';

type SendState = 'idle' | 'sending' | 'ok' | 'error';

/** Página "Contacto": datos de contacto + formulario que envía email vía formsubmit.co. */
@Component({
  selector: 'app-contacto',
  imports: [PageHeaderComponent, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header kicker="— Hablemos" title="Contacto"
      subtitle="¿Tienes preguntas sobre productos, tallas, envíos o quieres hacer un pedido? Escríbenos. Respondemos rápido." />

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
        <a class="cn__row" [href]="'mailto:' + email">
          <span class="cn__ic">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="1.6" />
              <path d="M4 7l8 6 8-6" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
            </svg>
          </span>
          <span class="cn__text"><span class="cn__label">Email</span><span class="cn__value">{{ email }}</span></span>
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
        @if (state() === 'ok') {
          <div class="cn__done">
            <span class="cn__done-ic" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" /></svg>
            </span>
            <h2 class="cn__done-title">¡Mensaje enviado!</h2>
            <p class="cn__done-text">Gracias por escribirnos. Te responderemos muy pronto.</p>
            <button type="button" class="cn__again" (click)="reset()">Enviar otro mensaje</button>
          </div>
        } @else {
          <form class="cn__form" [formGroup]="form" (ngSubmit)="submit()" novalidate>
            <div class="cn__two">
              <label class="cn__field">
                <span class="cn__flabel">Nombre</span>
                <input class="cn__input" type="text" formControlName="name" placeholder="John Smith" autocomplete="name" />
                @if (invalid('name')) { <span class="cn__err">Ingresa tu nombre.</span> }
              </label>
              <label class="cn__field">
                <span class="cn__flabel">Email</span>
                <input class="cn__input" type="email" formControlName="email" placeholder="john@example.com" autocomplete="email" />
                @if (invalid('email')) { <span class="cn__err">Ingresa un email válido.</span> }
              </label>
            </div>
            <label class="cn__field">
              <span class="cn__flabel">Asunto</span>
              <input class="cn__input" type="text" formControlName="subject" placeholder="Consulta sobre producto…" />
            </label>
            <label class="cn__field">
              <span class="cn__flabel">Mensaje</span>
              <textarea class="cn__input cn__textarea" formControlName="message" rows="5" placeholder="Escribe tu mensaje aquí…"></textarea>
              @if (invalid('message')) { <span class="cn__err">Escribe tu mensaje.</span> }
            </label>

            @if (state() === 'error') {
              <p class="cn__form-err">No se pudo enviar. Inténtalo de nuevo o escríbenos por WhatsApp.</p>
            }

            <button type="submit" class="cn__send" [disabled]="state() === 'sending'">
              @if (state() === 'sending') {
                <span class="cn__spin" aria-hidden="true"></span> Enviando…
              } @else {
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12l16-7-7 16-2-7-7-2z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" /></svg>
                Enviar mensaje
              }
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
  readonly email = STORE_EMAIL;
  readonly phone = STORE_PHONE_DISPLAY;
  readonly city = STORE_CITY;

  readonly state = signal<SendState>('idle');

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    subject: [''],
    message: ['', Validators.required],
  });

  constructor() {
    this.seo.update({
      title: 'Contacto · Ninetysix',
      description: 'Contáctanos: WhatsApp, email o el formulario. Respondemos rápido.',
    });
  }

  invalid(ctrl: string): boolean {
    const c = this.form.get(ctrl);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.state.set('sending');
    const v = this.form.getRawValue();
    try {
      const res = await fetch(`https://formsubmit.co/ajax/${this.email}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: v.name,
          email: v.email,
          _subject: v.subject || `Nuevo mensaje de ${v.name} · Ninetysix`,
          message: v.message,
          _template: 'table',
          _captcha: 'false',
        }),
      });
      if (!res.ok) {
        throw new Error('formsubmit error');
      }
      this.state.set('ok');
      this.form.reset();
    } catch {
      this.state.set('error');
    }
  }

  reset(): void {
    this.state.set('idle');
    this.form.reset();
  }
}
