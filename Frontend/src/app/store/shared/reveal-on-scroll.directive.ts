import { isPlatformBrowser } from '@angular/common';
import {
  Directive,
  ElementRef,
  PLATFORM_ID,
  afterNextRender,
  inject,
  input,
  numberAttribute,
} from '@angular/core';

/**
 * Aparición suave al entrar en el viewport (solo cliente, tras la hidratación).
 *
 * SEO/no-JS: en el servidor no hace nada → el contenido se renderiza visible.
 * En el cliente, si el elemento ya está a la vista al hidratar, se muestra sin
 * animación (evita parpadeo); si está bajo el pliegue, se oculta y se anima al
 * hacer scroll. Respeta `prefers-reduced-motion`.
 */
@Directive({ selector: '[appReveal]' })
export class RevealOnScrollDirective {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** Retardo opcional (ms) para escalonar la aparición de elementos hermanos. */
  readonly delay = input(0, { alias: 'appRevealDelay', transform: numberAttribute });

  constructor() {
    afterNextRender(() => {
      if (!this.isBrowser) {
        return;
      }
      const node = this.el.nativeElement;
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion) {
        return;
      }

      const rect = node.getBoundingClientRect();
      const alreadyVisible = rect.top < window.innerHeight && rect.bottom > 0;
      if (alreadyVisible) {
        node.classList.add('reveal-in');
        return;
      }

      node.classList.add('reveal-init');
      if (this.delay()) {
        node.style.setProperty('--reveal-delay', `${this.delay()}ms`);
      }

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              node.classList.remove('reveal-init');
              node.classList.add('reveal-in');
              observer.disconnect();
            }
          }
        },
        { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
      );
      observer.observe(node);
    });
  }
}
