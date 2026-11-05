import Image from "next/image";
import type { CSSProperties } from "react";
import type { SanityImage as SImage } from "@/sanity/types";

type Props = {
  image?: SImage;
  alt?: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  quality?: number;
  style?: CSSProperties;
};

export default function SanityImage({
  image,
  alt,
  sizes,
  className,
  priority,
  fill,
  quality,
  style,
}: Props) {
  const asset = image?.asset;
  if (!asset?.url) {
    return null;
  }
  const dims = asset.metadata?.dimensions;
  const lqip = asset.metadata?.lqip;
  const altText = alt ?? image?.alt ?? "";
  const blur = lqip ? ({ placeholder: "blur" as const, blurDataURL: lqip }) : {};

  if (fill) {
    return (
      <Image
        src={asset.url}
        alt={altText}
        fill
        sizes={sizes}
        className={className}
        style={style}
        priority={priority}
        quality={quality}
        {...blur}
      />
    );
  }

  return (
    <Image
      src={asset.url}
      alt={altText}
      width={dims?.width ?? 1600}
      height={dims?.height ?? 1066}
      sizes={sizes}
      className={className}
      style={style}
      priority={priority}
      quality={quality}
      {...blur}
    />
  );
}
