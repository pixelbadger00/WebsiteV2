import imageUrlBuilder from "@sanity/image-url";
import { dataset, projectId } from "../env";

const builder = imageUrlBuilder({ projectId, dataset });

// Derive the accepted source type from the builder (avoids a fragile deep import).
type ImageSource = Parameters<typeof builder.image>[0];

export function urlForImage(source: ImageSource) {
  return builder.image(source).auto("format").fit("max");
}
