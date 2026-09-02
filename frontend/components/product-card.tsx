import Image from "next/image";
import Link from "next/link";
import { HeartIcon } from "@heroicons/react/24/outline";
import type { Locale } from "@/lib/i18n";
import type { Product } from "@/lib/catalog";
import { formatPrice } from "@/lib/catalog";

export function ProductCard({ product, locale }: { product: Product; locale: Locale }) {
  return (
    <article className="product-card">
      <Link href={`/${locale}/product/${product.slug}`} className="product-image-wrap">
        {product.badge && <span className="product-badge">{product.badge[locale]}</span>}
        <Image src={product.image} alt={product.name[locale]} fill sizes="(max-width: 640px) 70vw, 24vw" className="product-image" />
      </Link>
      <div className="product-copy">
        <div>
          <p>{product.name[locale]}</p>
          <div className="price-line">
            <strong>{formatPrice(product.price, locale)}</strong>
            {product.previousPrice && <del>{formatPrice(product.previousPrice, locale)}</del>}
          </div>
        </div>
        <button type="button" className="heart-button" aria-label={locale === "ar" ? "أضف إلى المفضلة" : "Add to wishlist"}>
          <HeartIcon />
        </button>
      </div>
    </article>
  );
}

