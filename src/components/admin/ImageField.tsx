// Поле одного изображения: текущее фото, загрузка нового, удаление.
import { Checkbox } from "./fields";

export function ImageField({ label, name, current }: { label: string; name: string; current?: string | null }) {
  return (
    <div className="space-y-2 text-sm">
      <span className="block font-semibold">{label}</span>
      {current && (
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- превью в админке */}
          <img src={current} alt="" className="h-20 w-20 rounded-lg bg-surface object-contain" />
          <Checkbox label="Удалить" name={`${name}Remove`} />
        </div>
      )}
      <input type="file" name={name} accept="image/jpeg,image/png,image/webp" className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:font-semibold file:text-brand-700" />
    </div>
  );
}
