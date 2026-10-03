"use client";
// Галерея фото товара: большое фото и миниатюры. На телефоне фото листаются свайпом.
import { useRef, useState } from "react";
import Image from "next/image";

type Img = { id: number; url: string; alt: string | null };

export function Gallery({ images, name }: { images: Img[]; name: string }) {
  const [active, setActive] = useState(0);
  const stripRef = useRef<HTMLDivElement>(null);

  if (images.length === 0) {
    return <div className="aspect-square rounded-2xl bg-surface" />;
  }

  // Прокрутить ленту к выбранному фото
  function show(i: number) {
    setActive(i);
    const strip = stripRef.current;
    strip?.scrollTo({ left: strip.clientWidth * i, behavior: "smooth" });
  }

  return (
    <div>
      <div
        ref={stripRef}
        onScroll={(e) => {
          const el = e.currentTarget;
          setActive(Math.round(el.scrollLeft / el.clientWidth));
        }}
        className="flex snap-x snap-mandatory overflow-x-auto rounded-2xl border border-line bg-surface [scrollbar-width:none]"
      >
        {images.map((img, i) => (
          <div key={img.id} className="relative aspect-square w-full shrink-0 snap-center">
            <Image
              src={img.url}
              alt={img.alt ?? name}
              fill
              priority={i === 0}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain p-6"
              unoptimized={img.url.endsWith(".svg")}
            />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => show(i)}
              aria-label={`Фото ${i + 1}`}
              aria-current={i === active}
              className={`relative h-16 w-16 overflow-hidden rounded-lg border-2 bg-surface sm:h-20 sm:w-20 ${
                i === active ? "border-brand-500" : "border-transparent hover:border-line"
              }`}
            >
              <Image src={img.url} alt="" fill sizes="80px" className="object-contain p-1" unoptimized={img.url.endsWith(".svg")} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
