// Показ текста в формате Markdown (тексты страниц и статей из админки).
// HTML внутри текста не выполняется — это безопасно.
import Link from "next/link";
import ReactMarkdown from "react-markdown";

export function Markdown({ children }: { children: string }) {
  return (
    <div className="space-y-4 text-[15px] leading-relaxed text-ink/90 sm:text-base">
      <ReactMarkdown
        components={{
          h2: (p) => <h2 className="pt-4 text-xl font-extrabold text-ink sm:text-2xl" {...p} />,
          h3: (p) => <h3 className="pt-2 text-lg font-bold text-ink" {...p} />,
          ul: (p) => <ul className="list-disc space-y-1.5 pl-5 marker:text-brand-400" {...p} />,
          ol: (p) => <ol className="list-decimal space-y-1.5 pl-5" {...p} />,
          strong: (p) => <strong className="font-bold text-ink" {...p} />,
          a: ({ href = "", children }) =>
            href.startsWith("/") ? (
              <Link href={href} className="text-brand-700 underline underline-offset-2">{children}</Link>
            ) : (
              <a href={href} target="_blank" rel="noopener" className="text-brand-700 underline underline-offset-2">{children}</a>
            ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
