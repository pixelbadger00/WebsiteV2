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
}: {
  image?: SImage;
  alt?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  quality?: number;
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
