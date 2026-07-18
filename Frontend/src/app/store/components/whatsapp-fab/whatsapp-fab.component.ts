import { ChangeDetectionStrategy, Component } from '@angular/core';
import { whatsappLink } from '../../shared/store.config';

/**
 * Botón flotante de WhatsApp (esquina inferior derecha) presente en todas las
 * páginas de la tienda. Abre el chat con un mensaje inicial ya escrito para que
 * el cliente arranque la conversación con el vendedor.
 */
@Component({
  selector: 'app-whatsapp-fab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a
      class="wfab"
      [href]="href"
      target="_blank"
      rel="noopener"
      aria-label="Escríbenos por WhatsApp"
    >
      <span class="wfab__pulse" aria-hidden="true"></span>
      <svg class="wfab__icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M19.05 4.91A9.82 9.82 0 0012.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 004.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.02zM12.05 20.15h-.01a8.2 8.2 0 01-4.19-1.15l-.3-.18-3.11.82.83-3.03-.2-.31a8.2 8.2 0 01-1.26-4.36c0-4.54 3.7-8.24 8.25-8.24a8.2 8.2 0 015.83 2.42 8.19 8.19 0 012.41 5.83c0 4.54-3.7 8.23-8.24 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.13-.14.17-.24.25-.4.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43l-.48-.01c-.16 0-.43.06-.66.31-.22.24-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29z" />
      </svg>
    </a>
  `,
  styles: `
    :host { display: contents; }
    .wfab {
      position: fixed;
      right: clamp(16px, 4vw, 26px);
      bottom: clamp(16px, 4vw, 26px);
      z-index: 60;
      width: 58px;
      height: 58px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: #25d366;
      color: #fff;
      box-shadow: 0 10px 26px rgb(37 211 102 / 42%), 0 4px 12px rgb(0 0 0 / 30%);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .wfab:hover { transform: scale(1.07); box-shadow: 0 14px 32px rgb(37 211 102 / 52%), 0 6px 16px rgb(0 0 0 / 34%); }
    .wfab:active { transform: scale(0.96); }
    .wfab__icon { width: 32px; height: 32px; position: relative; z-index: 1; }
    .wfab__pulse {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: #25d366;
    }
    @media (prefers-reduced-motion: no-preference) {
      .wfab__pulse { animation: wfab-pulse 2.4s ease-out infinite; }
    }
    @keyframes wfab-pulse {
      0% { transform: scale(1); opacity: 0.55; }
      70% { transform: scale(1.9); opacity: 0; }
      100% { opacity: 0; }
    }
  `,
})
export class WhatsappFabComponent {
  private readonly message = '¡Hola Ninetysix! 👋 Me gustaría más información sobre sus productos.';
  readonly href = whatsappLink(this.message);
}
