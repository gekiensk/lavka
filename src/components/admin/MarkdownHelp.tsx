// Подсказка по разметке текста
export function MarkdownHelp() {
  return (
    <details className="text-xs text-muted">
      <summary className="cursor-pointer font-semibold">Как оформлять текст</summary>
      <ul className="mt-2 space-y-1 font-mono">
        <li>## Заголовок раздела</li>
        <li>**жирный текст**</li>
        <li>- пункт списка</li>
        <li>[текст ссылки](/delivery)</li>
        <li>Пустая строка — новый абзац</li>
      </ul>
    </details>
  );
}
