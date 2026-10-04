// Какие картинки показывать без оптимизации Next.js:
// SVG (векторные, сжимать нечего) и внешние ссылки (например, из файла импорта).
export function skipOptimization(url: string): boolean {
  return url.endsWith(".svg") || /^https?:\/\//.test(url);
}
