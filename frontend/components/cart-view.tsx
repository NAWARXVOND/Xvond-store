"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MinusIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { formatPrice } from "@/lib/catalog";
import type { Locale } from "@/lib/i18n";
import { appendStoreContext, storeForCategorySlug } from "@/lib/store-context";
import { useCommerce } from "./commerce-provider";

export function CartView({ locale }: { locale: Locale }) {
  const { cart, removeFromCart, updateQuantity } = useCommerce();
  const searchParams = useSearchParams();
  const hintedStore = searchParams.get("store");
  const store = hintedStore === "lifestyle" || hintedStore === "smart" ? hintedStore : null;
  const subtotal = cart.reduce((total, line) => total + line.product.price * line.quantity, 0);
  const ar = locale === "ar";
  const continueHref = store ? `/${locale}/${store}` : `/${locale}`;
  const checkoutHref = appendStoreContext(`/${locale}/checkout`, store);

  return (
    <main className="content-page shell commerce-page">
      <p className="eyebrow">{store === "lifestyle" ? "XVOND LIFESTYLE STORE" : store === "smart" ? "XVOND SMART STORE" : "XVOND STORE"}</p><h1>{ar ? "سلة التسوق" : "Shopping cart"}</h1>
      {cart.length === 0 ? (
        <div className="empty-card"><p>{ar ? "سلتك فارغة حاليًا." : "Your cart is currently empty."}</p><Link className="primary-button" href={continueHref}>{ar ? "متابعة التسوق" : "Continue shopping"}</Link></div>
      ) : (
        <div className="cart-layout">
          <div className="cart-lines">
            {cart.map(({ product, quantity }) => {
              const productHref = appendStoreContext(`/${locale}/product/${product.slug}`, storeForCategorySlug(product.category));
              return (
                <article className="cart-line" key={product.slug}>
                  <div className="cart-thumb"><Image src={product.image} alt={product.name[locale]} fill sizes="100px" /></div>
                  <div className="cart-line-copy"><Link href={productHref}>{product.name[locale]}</Link><strong>{formatPrice(product.price, locale)}</strong></div>
                  <div className="quantity-control"><button onClick={() => updateQuantity(product.slug, quantity - 1)} aria-label={ar ? "تقليل الكمية" : "Decrease quantity"}><MinusIcon /></button><span>{quantity}</span><button onClick={() => updateQuantity(product.slug, quantity + 1)} aria-label={ar ? "زيادة الكمية" : "Increase quantity"}><PlusIcon /></button></div>
                  <button className="remove-button" onClick={() => removeFromCart(product.slug)} aria-label={ar ? "حذف المنتج" : "Remove product"}><TrashIcon /></button>
                </article>
              );
            })}
          </div>
          <aside className="order-summary"><h2>{ar ? "ملخص الطلب" : "Order summary"}</h2><div><span>{ar ? "المجموع الفرعي" : "Subtotal"}</span><strong>{formatPrice(subtotal, locale)}</strong></div><p>{ar ? "يتم تحديد التوصيل والخصومات في الخطوة التالية." : "Delivery and discounts are calculated in the next step."}</p><Link className="primary-button" href={checkoutHref}>{ar ? "إتمام الطلب" : "Checkout"}</Link></aside>
        </div>
      )}
    </main>
  );
}
