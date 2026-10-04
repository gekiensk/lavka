import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PageTitle } from "@/components/admin/fields";
import { BannerForm } from "@/components/admin/BannerForm";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { deleteBanner } from "../../../actions/content";

export default async function EditBannerPage({ params }: PageProps<"/admin/banners/[id]">) {
  const banner = await db.banner.findUnique({ where: { id: Number((await params).id) || 0 } });
  if (!banner) notFound();
  return (
    <>
      <PageTitle actions={<ConfirmButton action={deleteBanner.bind(null, banner.id)} confirmText="Удалить баннер?">Удалить</ConfirmButton>}>Баннер</PageTitle>
      <BannerForm banner={banner} />
    </>
  );
}
