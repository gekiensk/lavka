// Страница 404 для адресов, которых нет на сайте вообще
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { NotFoundContent } from "@/components/ui/NotFoundContent";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <NotFoundContent />
      </main>
      <Footer />
    </>
  );
}
