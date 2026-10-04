"use client";
// Баннеры на главной: листаются свайпом и сменяются сами каждые 6 секунд.
import { skipOptimization } from "@/lib/images";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type Banner = { id: number; title: string; subtitle: string | null; image: string | null; link: string | null };

export function BannerSlider({ banners }: { banners: Banner[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = (i: number) => ref.current?.scrollTo({ left: ref.current.clientWidth * i, behavior: "smooth" });

  useEffect(() => {
    if (paused || banners.length < 2) return;
    const t = setInterval(() => go((active + 1) % banners.length), 6000);
    return () => clearInterval(t);
  }, [active, paused, banners.length]);

  return (
    <section className="relative" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onTouchStart={() => setPaused(true)} aria-label="Акции и предложения">
      <div
        ref={ref}
        onScroll={(e) => setActive(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        className="flex snap-x snap-mandatory overflow-x-auto rounded-3xl [scrollbar-width:none]"
      >
        {banners.map((b, i) => (
          <div key={b.id} className="relative flex w-full shrink-0 snap-center items-center gap-6 overflow-hidden bg-ink px-6 py-8 text-white sm:px-10 sm:py-12">
            {/* Фирменный элемент: три терракотовые полосы у правого края */}
            <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-6 hidden w-16 gap-2 sm:flex lg:right-10">
              <span className="w-3 bg-brand-500/90" />
              <span className="w-3 bg-brand-500/60" />
              <span className="w-3 bg-brand-500/30" />
            </span>
            <div className="relative max-w-xl flex-1">
              <h2 className="text-2xl font-extrabold leading-tight tracking-tight sm:text-4xl">{b.title}</h2>
              {b.subtitle && <p className="mt-3 text-gray sm:text-lg">{b.subtitle}</p>}
              {b.link && (
                <Link href={b.link} className="btn mt-6 bg-brand-600 text-white hover:bg-brand-500">Подробнее</Link>
              )}
            </div>
            {b.image && (
              <div className="relative mr-20 hidden h-48 w-48 shrink-0 overflow-hidden rounded-2xl bg-surface sm:block lg:mr-24 lg:h-56 lg:w-56">
                <Image src={b.image} alt="" fill sizes="224px" priority={i === 0} className="object-contain p-4" unoptimized={skipOptimization(b.image)} />
              </div>
            )}
          </div>
        ))}
      </div>
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-6 flex gap-2 sm:left-10">
          {banners.map((b, i) => (
            <button
              key={b.id}
              type="button"
              onClick={() => go(i)}
              aria-label={`Баннер ${i + 1}`}
              className={`h-2 rounded-full transition-all ${i === active ? "w-6 bg-white" : "w-2 bg-white/50"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
