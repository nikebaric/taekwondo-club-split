import { redirect } from "next/navigation";
import { parseLocale } from "@/i18n/locale";
import { localizedPath } from "@/i18n/routing";

type Props = { params: Promise<{ locale: string; slug: string }> };

export default async function PortalNovostiPostRedirect({ params }: Props) {
  const { slug, locale: raw } = await params;
  const locale = parseLocale(raw);
  redirect(localizedPath(`/novosti/${slug}`, locale));
}
