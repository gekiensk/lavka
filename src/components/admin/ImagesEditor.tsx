"use client";
// Фото товара: порядок (первое — главное), подписи, удаление, загрузка новых.
import { useState } from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";

type Img = { id: number; url: string; alt: string | null };

export function ImagesEditor({ initial }: { initial: Img[] }) {
  const [images, setImages] = useState(initial);

  const move = (i: number, dir: -1 | 1) => {
    const next = [...images];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    setImages(next);
  };

  return (
    <div className="space-y-4">
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {images.map((img, i) => (
            <div key={img.id} className="rounded-xl border border-line p-2">
              <input type="hidden" name="imageId" value={img.id} />
              <div className="relative aspect-square overflow-hidden rounded-lg bg-surface">
                {/* eslint-disable-next-line @next/next/no-img-element -- превью в админке */}
                <img src={img.url} alt="" className="h-full w-full object-contain" />
                {i === 0 && <span className="absolute left-1 top-1 rounded bg-brand-600 px-1.5 text-xs font-bold text-white">Главное</span>}
              </div>
              <input name={`imageAlt_${img.id}`} defaultValue={img.alt ?? ""} placeholder="Подпись (alt)" className="mt-2 h-8 w-full rounded-md border border-line px-2 text-xs outline-none" />
              <div className="mt-1 flex justify-between">
                <div className="flex">
                  <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="p-1.5 disabled:opacity-30" aria-label="Левее"><ArrowLeft className="h-4 w-4" /></button>
                  <button type="button" disabled={i === images.length - 1} onClick={() => move(i, 1)} className="p-1.5 disabled:opacity-30" aria-label="Правее"><ArrowRight className="h-4 w-4" /></button>
                </div>
                <button type="button" onClick={() => setImages(images.filter((x) => x.id !== img.id))} className="p-1.5 text-muted hover:text-sale" aria-label="Удалить фото"><X className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      <label className="block text-sm">
        <span className="mb-1 block font-semibold">Добавить фото</span>
        <input type="file" name="newImages" accept="image/jpeg,image/png,image/webp" multiple className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:font-semibold file:text-brand-700" />
        <span className="mt-1 block text-xs text-muted">JPG, PNG или WebP до 10 МБ. Можно выбрать несколько. Удаление и порядок применяются после «Сохранить».</span>
      </label>
    </div>
  );
}
