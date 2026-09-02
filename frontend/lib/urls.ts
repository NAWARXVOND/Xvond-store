export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://xvond.com/store";

export const absoluteUrl = (path = "") => `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;

