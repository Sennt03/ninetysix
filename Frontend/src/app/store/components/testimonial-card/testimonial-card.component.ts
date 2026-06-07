import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Tarjeta de testimonio: estrellas + cita + autor. */
@Component({
  selector: 'app-testimonial-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <figure class="tc">
      <div class="tc__stars" [attr.aria-label]="rating() + ' de 5 estrellas'">
        @for (s of stars(); track $index) {
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.1 6.47L12 17.9l-5.8 3.07 1.1-6.47-4.7-4.58 6.5-.95L12 2.5z"
              fill="currentColor"
            />
          </svg>
        }
      </div>
      <blockquote class="tc__quote">“{{ quote() }}”</blockquote>
      <figcaption class="tc__author">{{ author() }}</figcaption>
    </figure>
  `,
  styles: `
    .tc {
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 14px;
      padding: 28px 26px;
      background: var(--st-white);
      border-radius: var(--st-radius);
      border: 1px solid var(--st-line);
      box-shadow: 0 1px 2px rgb(43 29 24 / 5%);
      height: 100%;
    }
    .tc__stars {
      display: inline-flex;
      gap: 3px;
      color: var(--st-rose);
    }
    .tc__stars svg {
      width: 18px;
      height: 18px;
    }
    .tc__quote {
      margin: 0;
      font-size: 1.05rem;
      font-weight: 500;
      color: var(--st-espresso);
      line-height: 1.5;
    }
    .tc__author {
      margin-top: auto;
      font-size: 0.92rem;
      font-weight: 600;
      color: var(--st-muted);
    }
  `,
})
export class TestimonialCardComponent {
  readonly quote = input.required<string>();
  readonly author = input.required<string>();
  readonly rating = input(5);

  readonly stars = computed(() => Array.from({ length: this.rating() }));
}
