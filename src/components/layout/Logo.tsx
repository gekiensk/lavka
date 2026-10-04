// Логотип: знак-домик + «ДЕЛО ТРУБА» + «сантехническая лавка».
import Link from "next/link";
import { BrandMark } from "@/components/brand/BrandMark";

export function Logo({ className = "", inverse = false }: { className?: string; inverse?: boolean }) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`} aria-label="Дело Труба — на главную">
      <BrandMark className="h-10 w-10 lg:h-12 lg:w-12" inverse={inverse} />
      <span className="font-display leading-none">
        <span className={`block text-[17px] font-black uppercase tracking-tight lg:text-[19px] ${inverse ? "text-white" : "text-ink"}`}>Дело</span>
        <span className="block text-[17px] font-black uppercase tracking-tight text-brand-500 lg:text-[19px]">Труба</span>
        <span className={`mt-0.5 hidden font-sans text-[9px] font-semibold tracking-[0.18em] sm:block ${inverse ? "text-gray" : "text-muted"}`}>
          сантехническая лавка
        </span>
      </span>
    </Link>
  );
}
