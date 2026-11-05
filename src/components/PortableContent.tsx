import {
  PortableText,
  type PortableTextComponents,
  type PortableTextBlock,
} from "@portabletext/react";

const components: PortableTextComponents = {
  block: {
    h2: ({ children }) => (
      <h2 className="mt-10 mb-3 text-[clamp(1.6rem,3vw,2.25rem)]">{children}</h2>
    ),
    h3: ({ children }) => <h3 className="mt-8 mb-2">{children}</h3>,
    blockquote: ({ children }) => (
      <blockquote className="my-6 border-l-[3px] border-sage pl-4 text-slate-600 italic">
        {children}
      </blockquote>
    ),
    normal: ({ children }) => <p className="my-4 leading-[1.7]">{children}</p>,
  },
  marks: {
    strong: ({ children }) => <strong>{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    link: ({ children, value }) => {
      const href = (value as { href?: string })?.href ?? "#";
      const external = /^https?:\/\//.test(href);
      return (
        <a
          href={href}
          className="text-accent underline underline-offset-2 hover:text-accent-700"
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {children}
        </a>
      );
    },
  },
  list: {
    bullet: ({ children }) => <ul className="my-4 list-disc pl-6">{children}</ul>,
    number: ({ children }) => <ol className="my-4 list-decimal pl-6">{children}</ol>,
  },
  listItem: ({ children }) => <li className="my-1 leading-[1.7]">{children}</li>,
};

export default function PortableContent({
  value,
  className,
}: {
  value?: unknown;
  className?: string;
}) {
  if (!value || (Array.isArray(value) && value.length === 0)) {
    return null;
  }
  return (
    <div className={className}>
      <PortableText value={value as PortableTextBlock[]} components={components} />
    </div>
  );
}
