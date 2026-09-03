"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeartIcon, HomeIcon, Squares2X2Icon, UserCircleIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import type { Locale } from "@/lib/i18n";
import { useCommerce } from "./commerce-provider";

export function MobileStoreNav({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const { cartCount } = useCommerce();
  const ar = locale === "ar";
  const items = [
    { href: `/${locale}`, label: ar ? "الرئيسية" : "Home", icon: HomeIcon },
    { href: `/${locale}/shop`, label: ar ? "الأقسام" : "Shop", icon: Squares2X2Icon },
    { href: `/${locale}/wishlist`, label: ar ? "المفضلة" : "Wishlist", icon: HeartIcon },
    { href: `/${locale}/account`, label: ar ? "حسابي" : "Account", icon: UserCircleIcon },
    { href: `/${locale}/cart`, label: ar ? "السلة" : "Cart", icon: ShoppingBagIcon, count: cartCount },
  ];

  return (
    <nav className="mobile-store-nav" aria-label={ar ? "تنقل المتجر" : "Store navigation"}>
      {items.map((item) => {
        const active = item.href === `/${locale}` ? pathname === item.href : pathname.startsWith(item.href);
        const Icon = item.icon;
        return <Link key={item.href} href={item.href} className={active ? "active" : ""}><span className="mobile-nav-icon"><Icon />{item.count ? <b>{item.count}</b> : null}</span><small>{item.label}</small></Link>;
      })}
    </nav>
  );
}
