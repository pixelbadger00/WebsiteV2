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

  // Honor the Sanity hotspot as object-position so editors can reframe a cover
  // image in Studio (drag the hotspot) and it applies everywhere the image is
  // rendered. An explicit `style.objectPosition` passed by the caller wins.
  const hs = image?.hotspot;
  const hotspotPosition =
    hs && typeof hs.x === "number" && typeof hs.y === "number"
      ? `${(hs.x * 100).toFixed(2)}% ${(hs.y * 100).toFixed(2)}%`
      : undefined;
  const mergedStyle: CSSProperties | undefined =
    hotspotPosition || style
      ? { objectPosition: hotspotPosition, ...style }
      : undefined;

  if (fill) {
    return (
      <Image
        src={asset.url}
        alt={altText}
        fill
        sizes={sizes}
        className={className}
        style={mergedStyle}
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
      style={mergedStyle}
      priority={priority}
      quality={quality}
      {...blur}
    />
  );
}
