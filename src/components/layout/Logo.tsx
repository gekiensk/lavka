// Текстовый логотип: капля + название.
import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`} aria-label="СанТех Лавка — на главную">
      <svg viewBox="0 0 24 24" className="h-8 w-8 shrink-0" aria-hidden="true">
        <path
          d="M12 2.5c-.3 0-.6.15-.8.4C9.4 5.3 5 11.2 5 15a7 7 0 0 0 14 0c0-3.8-4.4-9.7-6.2-12.1a1 1 0 0 0-.8-.4Z"
          className="fill-brand-500"
        />
        <path d="M9 15.5a3 3 0 0 0 3 3" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <span className="leading-none">
        <span className="block text-lg font-extrabold tracking-tight text-ink">СанТех Лавка</span>
        <span className="hidden text-[11px] font-medium text-muted sm:block">магазин сантехники</span>
      </span>
    </Link>
  );
}
