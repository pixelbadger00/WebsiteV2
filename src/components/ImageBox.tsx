import SanityImage from "./SanityImage";
import type { SanityImage as SImage } from "@/sanity/types";

// Renders a Sanity image, or a calm branded placeholder when none is assigned
// yet (images are assigned per document in Studio — see migration notes).
export default function ImageBox({
  image,
  alt,
  sizes,
  priority,
  className,
  quality,
  objectPosition,
}: {
  image?: SImage;
  alt?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  quality?: number;
  /** CSS object-position for the cover image, e.g. "80% 50%". Default center. */
  objectPosition?: string;
}) {
  const has = Boolean(image?.asset?.url);
  return (
    <div
      className={`relative overflow-hidden ${has ? "bg-slate-900" : "bg-gradient-to-br from-porcelain to-slate-300"} ${className ?? ""}`}
    >
      {has ? (
        <SanityImage
          image={image}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          quality={quality}
          className="h-full w-full object-cover"
          style={objectPosition ? { objectPosition } : undefined}
        />
      ) : (
        <span
          aria-hidden
          className="absolute inset-0 grid place-items-center font-serif text-4xl text-slate-600/40"
        >
          ◠
        </span>
      )}
    </div>
  );
}
