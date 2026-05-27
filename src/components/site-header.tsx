import Image from "next/image";
import Link from "next/link";
import { CloseDetailsLink } from "@/components/close-details-link";
import { HeaderAccount, HeaderAccountMobile } from "@/components/header-account";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { OutsideClickDetails } from "@/components/outside-click-details";
import { site } from "@/config/site";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { localizedPath } from "@/i18n/routing";
import { getMemberSession, isAdminSession } from "@/lib/auth-check";

type Props = {
  locale: Locale;
};

export async function SiteHeader({ locale }: Props) {
  const t = getDictionary(locale);
  const session = await getMemberSession();
  const memberName = session?.name ?? null;
  const memberEmail = session?.email ?? null;
  const adminHubVisible = await isAdminSession();

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border-subtle)] bg-[var(--surface)] shadow-[var(--shadow-sm)]">
      <div className="mx-auto flex w-full max-w-[min(100%,90rem)] items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4 lg:gap-5">
        <Link
          href={localizedPath("/", locale)}
          className="group flex shrink-0 items-center gap-2.5 rounded-lg outline-none ring-offset-2 ring-offset-white focus-visible:ring-2 focus-visible:ring-[var(--accent)]/35 sm:gap-3.5"
        >
          <Image
            src={site.logo}
            alt=""
            width={56}
            height={56}
            className="h-11 w-11 shrink-0 object-contain sm:h-14 sm:w-14"
            priority
          />
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="font-[family-name:var(--font-display)] text-lg tracking-[0.08em] text-slate-900 sm:text-2xl">
              {site.brand.line1.toUpperCase()}
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-[var(--muted)] sm:text-[11px] sm:tracking-[0.35em]">
              {site.brand.line2}
            </span>
          </div>
        </Link>
        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-0 lg:flex xl:gap-0.5">
          {t.nav.map((item) => (
            <Link
              key={item.href}
              href={localizedPath(item.href, locale)}
              className="relative whitespace-nowrap rounded-md px-1.5 py-2 text-[12px] font-medium uppercase tracking-tight text-slate-600 transition-colors duration-200 after:pointer-events-none after:absolute after:inset-x-1.5 after:bottom-1.5 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-[var(--accent)] after:transition-transform hover:bg-slate-100/80 hover:text-slate-900 hover:after:scale-x-100 xl:px-2 xl:text-[13px] xl:after:inset-x-2"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <LocaleSwitcher locale={locale} className="hidden sm:flex" />
          <HeaderAccount
            memberName={memberName}
            memberEmail={memberEmail}
            adminHubVisible={adminHubVisible}
          />
          <MobileNav
            locale={locale}
            memberEmail={memberEmail}
            memberName={memberName}
            adminHubVisible={adminHubVisible}
          />
        </div>
      </div>
    </header>
  );
}

function MobileNav({
  locale,
  memberName,
  memberEmail,
  adminHubVisible,
}: {
  locale: Locale;
  memberName: string | null;
  memberEmail: string | null;
  adminHubVisible: boolean;
}) {
  const t = getDictionary(locale);

  return (
    <OutsideClickDetails className="relative lg:hidden">
      <summary className="list-none cursor-pointer rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 [&::-webkit-details-marker]:hidden">
        {t.common.menu}
      </summary>
      <div className="absolute right-0 mt-2 w-56 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] p-2 shadow-xl">
        <div className="mb-2 flex justify-center border-b border-slate-100 pb-2 sm:hidden">
          <LocaleSwitcher locale={locale} />
        </div>
        {t.nav.map((item) => (
          <CloseDetailsLink
            key={item.href}
            href={localizedPath(item.href, locale)}
            className="block rounded-md px-3 py-2 text-xs font-medium uppercase tracking-tight text-slate-700 hover:bg-slate-100 hover:text-slate-900"
          >
            {item.label}
          </CloseDetailsLink>
        ))}
        {adminHubVisible ? (
          <CloseDetailsLink
            href="/admin"
            className="block rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-tight text-[var(--accent)] hover:bg-slate-100"
          >
            {t.common.admin}
          </CloseDetailsLink>
        ) : null}
        <HeaderAccountMobile memberName={memberName} memberEmail={memberEmail} />
      </div>
    </OutsideClickDetails>
  );
}
