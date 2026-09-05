import Image from "next/image";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

type StoreLogoProps = {
  size?: number;
  priority?: boolean;
  className?: string;
};

export function StoreLogo({ size = 96, priority = false, className = "" }: StoreLogoProps) {
  return (
    <Image
      src={`${basePath}/xvond-store-logo.png`}
      alt="Xvond Store"
      width={size}
      height={size}
      sizes={`${size}px`}
      priority={priority}
      className={`store-logo ${className}`.trim()}
    />
  );
}
