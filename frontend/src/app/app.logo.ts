import { NgClass } from "@angular/common";
import { Component, input } from "@angular/core";

@Component({
	selector: "app-logo",
	template: `
    <div class="text-primary">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1024 1024"
        [ngClass]="{
          'size-6': size() === 'xs',
          'size-8': size() === 'sm',
          'size-10': size() === 'md',
          'size-32': size() === 'xl',
          'size-48': size() === '2xl'
        }"
      >
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="currentColor" />
            <stop offset="100%" stop-color="currentColor" />
          </linearGradient>
        </defs>

        <!-- Background -->
        <circle cx="512" cy="512" r="480" class="fill-base-300" />

        <!-- Gradient ring -->
        <circle cx="512" cy="512" r="430" fill="none" stroke="url(#ringGrad)" stroke-width="40" />

        <!-- Text -->
        <text
          x="512"
          y="560"
          text-anchor="middle"
          font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Inter, Arial"
          font-size="260"
          font-weight="700"
          fill="#FFFFFF"
          dominant-baseline="middle"
        >
          gURL
        </text>
      </svg>
    </div>
  `,
	imports: [NgClass],
})
export class AppLogo {
	size = input.required<"xs" | "sm" | "md" | "xl" | "2xl">();
}
