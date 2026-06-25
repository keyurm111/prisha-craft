import { useEffect, useMemo } from "react";
import { JsonLd, toAbsoluteUrl } from "@/lib/seo";

interface SEOProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
  canonicalUrl?: string;
  image?: string;
  noindex?: boolean;
  jsonLd?: JsonLd | JsonLd[];
}

const SCHEMA_ATTRIBUTE = "data-prisha-json-ld";

const safeJson = (value: JsonLd) => JSON.stringify(value).replace(/</g, "\\u003c");

const upsertMeta = (attribute: "name" | "property", key: string, content?: string) => {
  if (!content) return;

  let meta = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute(attribute, key);
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", content);
};

const upsertCanonical = (href?: string) => {
  if (!href) return;

  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }
  canonical.setAttribute("href", href);
};

export default function SEO({
  title,
  description,
  canonicalPath,
  canonicalUrl,
  image,
  noindex,
  jsonLd,
}: SEOProps) {
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "/";
  const resolvedCanonical = canonicalUrl || toAbsoluteUrl(canonicalPath || currentPath);
  const resolvedImage = toAbsoluteUrl(image);
  const jsonLdItems = useMemo(() => {
    if (!jsonLd) return [];
    return Array.isArray(jsonLd) ? jsonLd : [jsonLd];
  }, [jsonLd]);
  const jsonLdKey = useMemo(() => JSON.stringify(jsonLdItems), [jsonLdItems]);

  useEffect(() => {
    if (title) {
      document.title = title;
      upsertMeta("property", "og:title", title);
      upsertMeta("name", "twitter:title", title);
    }

    if (description) {
      upsertMeta("name", "description", description);
      upsertMeta("property", "og:description", description);
      upsertMeta("name", "twitter:description", description);
    }

    upsertCanonical(resolvedCanonical);
    upsertMeta("property", "og:url", resolvedCanonical);

    if (resolvedImage) {
      upsertMeta("property", "og:image", resolvedImage);
      upsertMeta("name", "twitter:image", resolvedImage);
    }

    upsertMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow");

    const schemas = JSON.parse(jsonLdKey) as JsonLd[];
    const scripts = schemas.map((schema) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute(SCHEMA_ATTRIBUTE, "true");
      script.innerHTML = safeJson(schema);
      document.head.appendChild(script);
      return script;
    });

    return () => {
      scripts.forEach((script) => script.remove());
    };
  }, [title, description, resolvedCanonical, resolvedImage, noindex, jsonLdKey]);

  return null;
}
