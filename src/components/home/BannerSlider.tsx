"use client";
// Баннеры на главной: листаются свайпом и сменяются сами каждые 6 секунд.
import { skipOptimization } from "@/lib/images";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { PIPE_PHOTO_BOX, PipeArt } from "@/components/brand/PipeArt";

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
    <section className="relative h-full min-w-0" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onTouchStart={() => setPaused(true)} aria-label="Акции и предложения">
      <div
        ref={ref}
        onScroll={(e) => setActive(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        className="no-scrollbar flex h-full snap-x snap-mandatory overflow-x-auto rounded-[2rem]"
      >
        {banners.map((b, i) => (
          <div key={b.id} className="relative flex min-h-80 w-full shrink-0 snap-center overflow-hidden bg-ink text-white sm:min-h-96">
            {/* Фирменная труба с краном; фото товара — внутри её петли */}
            <div aria-hidden="true" className="pointer-events-none absolute bottom-0 right-0 hidden aspect-[4/3] w-[26rem] sm:block lg:w-[30rem]">
              <PipeArt className="absolute inset-0 h-full w-full" />
              {b.image && (
                <div className={`absolute ${PIPE_PHOTO_BOX} rounded-3xl bg-surface`}>
                  <Image src={b.image} alt="" fill sizes="192px" priority={i === 0} className="object-contain p-4" unoptimized={skipOptimization(b.image)} />
                </div>
              )}
            </div>
            <div className="relative flex max-w-xl flex-col justify-center px-6 pb-16 pt-10 sm:max-w-[55%] sm:px-10 lg:px-14">
              <h2 className="text-3xl font-black leading-[1.05] sm:text-5xl">{b.title}</h2>
              {b.subtitle && <p className="mt-4 max-w-md text-gray sm:text-lg">{b.subtitle}</p>}
              {b.link && (
                <Link href={b.link} className="btn mt-7 self-start bg-brand-500 text-ink hover:bg-brand-300">Подробнее</Link>
              )}
            </div>
          </div>
        ))}
      </div>
      {banners.length > 1 && (
        <div className="absolute bottom-6 left-6 flex gap-2 sm:left-10 lg:left-14">
          {banners.map((b, i) => (
            <button
              key={b.id}
              type="button"
              onClick={() => go(i)}
              aria-label={`Баннер ${i + 1}`}
              aria-current={i === active}
              className={`h-1.5 rounded-full transition-all ${i === active ? "w-8 bg-brand-500" : "w-3 bg-white/35 hover:bg-white/60"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
