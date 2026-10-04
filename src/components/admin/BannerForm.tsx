import { AdminForm } from "./AdminForm";
import { ImageField } from "./ImageField";
import { Checkbox, Panel, TextField } from "./fields";
import { saveBanner } from "@/app/admin/actions/content";
import type { Banner } from "@/generated/prisma/client";

export function BannerForm({ banner: b }: { banner?: Banner }) {
  return (
    <AdminForm action={saveBanner.bind(null, b?.id ?? null)} className="max-w-2xl">
      <Panel>
        <TextField label="Заголовок *" name="title" defaultValue={b?.title} required />
        <TextField label="Подзаголовок" name="subtitle" defaultValue={b?.subtitle ?? ""} />
        <TextField label="Ссылка кнопки «Подробнее»" name="link" defaultValue={b?.link ?? ""} placeholder="/catalog/smesiteli" hint="Адрес страницы на сайте. Пусто — без кнопки" />
        <ImageField label="Картинка (справа от текста, на компьютере)" name="image" current={b?.image} />
        <TextField label="Порядок" name="sortOrder" type="number" defaultValue={b?.sortOrder ?? 0} />
        <Checkbox label="Показывать" name="isActive" defaultChecked={b?.isActive ?? true} />
      </Panel>
    </AdminForm>
  );
}
