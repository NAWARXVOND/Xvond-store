"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { HeartIcon, HomeIcon, Squares2X2Icon, UserCircleIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import type { Locale } from "@/lib/i18n";
import { appendStoreContext, storeForPath } from "@/lib/store-context";
import { useCommerce } from "./commerce-provider";

export function MobileStoreNav({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { cartCount } = useCommerce();
  const ar = locale === "ar";
  const store = storeForPath(pathname, locale, searchParams.get("store"));

  if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/admin`)) return null;

  const homeHref = store ? `/${locale}/${store}` : `/${locale}`;
  const items = [
    { href: homeHref, label: ar ? "الرئيسية" : "Home", icon: HomeIcon },
    { href: store ? `/${locale}/${store}` : `/${locale}`, label: ar ? "الأقسام" : "Shop", icon: Squares2X2Icon },
    { href: appendStoreContext(`/${locale}/wishlist`, store), label: ar ? "المفضلة" : "Wishlist", icon: HeartIcon },
    { href: appendStoreContext(`/${locale}/account`, store), label: ar ? "حسابي" : "Account", icon: UserCircleIcon },
    { href: appendStoreContext(`/${locale}/cart`, store), label: ar ? "السلة" : "Cart", icon: ShoppingBagIcon, count: cartCount },
  ];

  return (
    <nav className="mobile-store-nav" aria-label={ar ? "تنقل المتجر" : "Store navigation"}>
      {items.map((item, index) => {
        const active = index === 0
          ? pathname === homeHref
          : index === 1
            ? pathname.startsWith(homeHref) || Boolean(store && pathname.includes(`/category/`))
            : pathname.startsWith(item.href.split("?")[0]);
        const Icon = item.icon;
        return <Link key={`${item.href}-${index}`} href={item.href} className={active ? "active" : ""}><span className="mobile-nav-icon"><Icon />{item.count ? <b>{item.count}</b> : null}</span><small>{item.label}</small></Link>;
      })}
    </nav>
  );
}
