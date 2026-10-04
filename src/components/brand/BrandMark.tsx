// Знак «Дело Труба»: домик (слева графит, справа терракота), кран и синяя капля.
// inverse — для тёмного фона: графитовые части становятся белыми.
import { useId } from "react";

export function BrandMark({ className = "h-10 w-10", inverse = false }: { className?: string; inverse?: boolean }) {
  const clipId = useId();
  const dark = inverse ? "#ffffff" : "#1F2937";
  return (
    <svg viewBox="0 0 64 64" className={`shrink-0 ${className}`} aria-hidden="true">
      <defs>
        {/* Правая половина крыши и стены — терракотовая */}
        <clipPath id={clipId}>
          <rect x="32" y="0" width="32" height="64" />
        </clipPath>
      </defs>
      <g fill="none" strokeWidth="7" strokeLinejoin="miter">
        <path d="M9 60V29.5L32 9L55 29.5V60" stroke={dark} />
        <path d="M9 60V29.5L32 9L55 29.5V60" stroke="#D97706" clipPath={`url(#${clipId})`} />
        <path d="M9 39h22a8 8 0 0 1 8 8v1.5" stroke={dark} />
        <path d="M24 38v-8M19 30h10" stroke={dark} strokeWidth="4.5" strokeLinecap="round" />
      </g>
      <path d="M39 52c-2.6 3.3-4.2 5.6-4.2 7.4a4.2 4.2 0 0 0 8.4 0c0-1.8-1.6-4.1-4.2-7.4Z" fill="#2563EB" />
    </svg>
  );
}
