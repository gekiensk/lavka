import type { Metadata } from "next";
import { getSettings } from "@/lib/catalog";
import { SETTING_FIELDS } from "@/lib/setting-fields";
import { AdminForm } from "@/components/admin/AdminForm";
import { PageTitle, Panel, TextField } from "@/components/admin/fields";
import { saveSettings } from "../../actions/content";
import { changePassword } from "../../actions/auth";

export const metadata: Metadata = { title: "Настройки" };

export default async function SettingsPage() {
  const settings = await getSettings();
  return (
    <>
      <PageTitle>Настройки</PageTitle>
      <div className="grid max-w-5xl gap-5 xl:grid-cols-2">
        <AdminForm action={saveSettings}>
          <Panel title="Контакты магазина">
            {SETTING_FIELDS.map((f) => (
              <TextField key={f.key} label={f.label} name={f.key} defaultValue={settings[f.key]} hint={f.hint} />
            ))}
          </Panel>
        </AdminForm>
        <AdminForm action={changePassword} submitText="Сменить пароль">
          <Panel title="Пароль администратора">
            <TextField label="Текущий пароль" name="current" type="password" autoComplete="current-password" required />
            <TextField label="Новый пароль" name="next" type="password" autoComplete="new-password" minLength={8} required hint="Не короче 8 символов" />
          </Panel>
        </AdminForm>
      </div>
      <p className="mt-5 max-w-3xl text-sm text-muted">
        Telegram-бот и почта для уведомлений о заказах настраиваются в файле <code>.env</code> на сервере (см. README).
      </p>
    </>
  );
}
