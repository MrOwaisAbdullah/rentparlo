import { PortableTextComponents } from "@portabletext/react";
import { ReactNode } from "react";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";

export const CustomComponent: PortableTextComponents = {
  block: {
    h1: (props: { children?: ReactNode }) => {
      const extractText = (content: ReactNode | undefined): string => {
        if (Array.isArray(content) && content[0]) {
          if (typeof content[0] === "string") return content[0];
          if (typeof content[0] === "object" && "props" in content[0]) {
            return String(
              (content[0] as { props?: { children?: ReactNode } }).props
                ?.children || ""
            );
          }
        }
        return "";
      };
      const text = extractText(props.children);
      const id = text ? text.toLowerCase().replace(/\s+/g, "-") : "";
      return (
        <h1
          id={id}
          className="text-3xl lg:text-4xl font-bold mt-12 mb-6 text-gray-900 first:mt-0"
        >
          {props.children}
        </h1>
      );
    },
    h2: (props: { children?: ReactNode }) => {
      const extractText = (content: ReactNode | undefined): string => {
        if (Array.isArray(content) && content[0]) {
          if (typeof content[0] === "string") return content[0];
          if (typeof content[0] === "object" && "props" in content[0]) {
            return String(
              (content[0] as { props?: { children?: ReactNode } }).props
                ?.children || ""
            );
          }
        }
        return "";
      };
      const text = extractText(props.children);
      const id = text ? text.toLowerCase().replace(/\s+/g, "-") : "";
      return (
        <h2
          id={id}
          className="text-2xl lg:text-3xl font-bold mt-10 mb-4 text-gray-900"
        >
          {props.children}
        </h2>
      );
    },
    h3: (props: { children?: ReactNode }) => {
      const extractText = (content: ReactNode | undefined): string => {
        if (Array.isArray(content) && content[0]) {
          if (typeof content[0] === "string") return content[0];
          if (typeof content[0] === "object" && "props" in content[0]) {
            return String(
              (content[0] as { props?: { children?: ReactNode } }).props
                ?.children || ""
            );
          }
        }
        return "";
      };
      const text = extractText(props.children);
      const id = text ? text.toLowerCase().replace(/\s+/g, "-") : "";
      return (
        <h3
          id={id}
          className="text-xl lg:text-2xl font-semibold mt-8 mb-3 text-gray-900"
        >
          {props.children}
        </h3>
      );
    },
    h4: (props: { children?: ReactNode }) => {
      const extractText = (content: ReactNode | undefined): string => {
        if (Array.isArray(content) && content[0]) {
          if (typeof content[0] === "string") return content[0];
          if (typeof content[0] === "object" && "props" in content[0]) {
            return String(
              (content[0] as { props?: { children?: ReactNode } }).props
                ?.children || ""
            );
          }
        }
        return "";
      };
      const text = extractText(props.children);
      const id = text ? text.toLowerCase().replace(/\s+/g, "-") : "";
      return (
        <h4 id={id} className="text-lg font-semibold mt-6 mb-2 text-gray-900">
          {props.children}
        </h4>
      );
    },
    h5: (props: { children?: ReactNode }) => {
      const extractText = (content: ReactNode | undefined): string => {
        if (Array.isArray(content) && content[0]) {
          if (typeof content[0] === "string") return content[0];
          if (typeof content[0] === "object" && "props" in content[0]) {
            return String(
              (content[0] as { props?: { children?: ReactNode } }).props
                ?.children || ""
            );
          }
        }
        return "";
      };
      const text = extractText(props.children);
      const id = text ? text.toLowerCase().replace(/\s+/g, "-") : "";
      return (
        <h5 id={id} className="text-base font-semibold mt-5 mb-2 text-gray-900">
          {props.children}
        </h5>
      );
    },
    h6: (props: { children?: ReactNode }) => {
      const extractText = (content: ReactNode | undefined): string => {
        if (Array.isArray(content) && content[0]) {
          if (typeof content[0] === "string") return content[0];
          if (typeof content[0] === "object" && "props" in content[0]) {
            return String(
              (content[0] as { props?: { children?: ReactNode } }).props
                ?.children || ""
            );
          }
        }
        return "";
      };
      const text = extractText(props.children);
      const id = text ? text.toLowerCase().replace(/\s+/g, "-") : "";
      return (
        <h6 id={id} className="text-sm font-semibold mt-4 mb-2 text-gray-900">
          {props.children}
        </h6>
      );
    },
    blockquote: ({ children }: { children?: ReactNode }) => (
      <blockquote className="border-l-4 border-purple-500 bg-purple-50 pl-6 py-4 my-6 italic text-gray-700 rounded-r-lg">
        {children}
      </blockquote>
    ),
    normal: ({ children }: { children?: ReactNode }) => (
      <p className="text-base lg:text-lg leading-relaxed mb-6 text-gray-700">
        {children}
      </p>
    ),
  },
  list: {
    bullet: ({ children }: { children?: ReactNode }) => (
      <ul className="list-disc text-base lg:text-lg ml-6 mb-6 space-y-2 text-gray-700 marker:text-purple-600">
        {children}
      </ul>
    ),
    number: ({ children }: { children?: ReactNode }) => (
      <ol className="list-decimal text-base lg:text-lg ml-6 mb-6 space-y-2 text-gray-700 marker:text-purple-600">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }: { children?: ReactNode }) => (
      <li className="pl-2 leading-relaxed">{children}</li>
    ),
    number: ({ children }: { children?: ReactNode }) => (
      <li className="pl-2 leading-relaxed">{children}</li>
    ),
  },
  marks: {
    bold: ({ children }: { children?: ReactNode }) => (
      <strong className="font-semibold text-gray-900">{children}</strong>
    ),
    italic: ({ children }: { children?: ReactNode }) => (
      <em className="italic text-gray-700">{children}</em>
    ),
    underline: ({ children }: { children?: ReactNode }) => (
      <span className="underline text-gray-700">{children}</span>
    ),
    link: (props: { value?: { href?: string }; children?: ReactNode }) => (
      <a
        href={props.value?.href || "#"}
        target="_blank"
        rel="noopener noreferrer"
        className="text-purple-600 hover:text-purple-700 underline font-medium"
      >
        {props.children}
      </a>
    ),
    strong: ({ children }: { children?: ReactNode }) => (
      <strong className="font-bold text-gray-900">{children}</strong>
    ),
    em: ({ children }: { children?: ReactNode }) => (
      <em className="italic text-gray-700">{children}</em>
    ),
    code: ({ children }: { children?: ReactNode }) => (
      <code className="bg-purple-100 text-purple-800 text-sm px-2 py-1 rounded-md font-mono">
        {children}
      </code>
    ),
    "strike-through": ({ children }: { children?: ReactNode }) => (
      <span className="line-through text-gray-600">{children}</span>
    ),
    highlight: ({ children }: { children?: ReactNode }) => (
      <span className="bg-yellow-200 text-gray-900 px-1 py-0.5 rounded">
        {children}
      </span>
    ),
  },
  types: {
    image: ({
      value,
    }: {
      value: { asset?: { _ref?: string }; alt?: string };
    }) => {
      if (!value?.asset?._ref) {
        return null;
      }
      return (
        <div className="relative w-full my-8 rounded-lg overflow-hidden shadow-lg">
          <Image
            src={urlFor(value).url()}
            alt={value.alt || "Blog post image"}
            className="w-full h-auto object-cover"
            width={800}
            height={600}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
            quality={90}
            priority={false}
          />
        </div>
      );
    },
  },
};
