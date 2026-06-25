export type JsonLdValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | JsonLdValue[]
  | { [key: string]: JsonLdValue };
export type JsonLd = { [key: string]: JsonLdValue };

const DEFAULT_SITE_URL = "https://www.prishacrafts.com";
export const SITE_NAME = "Prisha Crafts";
export const SITE_DESCRIPTION =
  "Premium handcrafted bags, totes, backpacks, and accessories from experienced artisan manufacturers.";
export const SITE_EMAIL = "info@prishacrafts.com";
export const SITE_PHONE = "+91 99999 99999";
export const DEFAULT_CURRENCY = "INR";

export interface SchemaProductVariant {
  _id?: string;
  sku?: string;
  options?: Record<string, string>;
  price?: number;
  mrp?: number;
  stock?: number;
  image?: string;
  images?: string[];
}

export interface SchemaProduct {
  _id?: string;
  name?: string;
  sku?: string;
  slug?: string;
  description?: string;
  price?: number;
  mrp?: number;
  mainImage?: string;
  images?: string[];
  video?: string;
  category?: {
    _id?: string;
    name?: string;
    slug?: string;
  };
  stock?: number;
  highlights?: string[];
  specifications?: Record<string, string>;
  shippingDimensions?: {
    length?: number;
    width?: number;
    height?: number;
    weight?: number;
  };
  variants?: SchemaProductVariant[];
}

export interface BreadcrumbItem {
  name: string;
  path?: string;
  url?: string;
}

const isBrowser = typeof window !== "undefined";

export const getSiteUrl = () => {
  const envUrl =
    import.meta.env.VITE_SITE_URL ||
    import.meta.env.VITE_CLIENT_URL ||
    import.meta.env.VITE_FRONTEND_URL;
  const browserUrl = isBrowser ? window.location.origin : "";
  return String(envUrl || browserUrl || DEFAULT_SITE_URL).replace(/\/+$/, "");
};

export const toAbsoluteUrl = (url?: string) => {
  const siteUrl = getSiteUrl();

  if (!url) return undefined;
  try {
    return new URL(url, siteUrl).toString();
  } catch {
    const normalizedPath = url.startsWith("/") ? url : `/${url}`;
    return `${siteUrl}${normalizedPath}`;
  }
};

export const getProductPath = (product: SchemaProduct) =>
  `/product/${product.slug || product._id || ""}`;

const cleanText = (text?: string, fallback = "") =>
  (text || fallback).replace(/\s+/g, " ").trim();

const asPrice = (price?: number) => {
  if (typeof price !== "number" || Number.isNaN(price) || price <= 0) {
    return undefined;
  }
  return Number(price.toFixed(2));
};

const compactJsonLd = (value: JsonLdValue): JsonLdValue | undefined => {
  if (Array.isArray(value)) {
    const compacted = value.map(compactJsonLd).filter((item) => item !== undefined);
    return compacted.length > 0 ? compacted : undefined;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as { [key: string]: JsonLdValue })
      .map(([key, entryValue]) => [key, compactJsonLd(entryValue)] as const)
      .filter(([, entryValue]) => entryValue !== undefined && entryValue !== "");

    if (entries.length === 0) return undefined;
    return Object.fromEntries(entries);
  }

  if (value === null || value === undefined) return undefined;
  return value;
};

const uniqueUrls = (urls: Array<string | undefined>) =>
  Array.from(new Set(urls.map(toAbsoluteUrl).filter(Boolean)));

const getAvailability = (stock?: number) => {
  if (typeof stock !== "number") return undefined;
  return stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";
};

export const getOrganizationId = () => `${getSiteUrl()}#organization`;
export const getWebsiteId = () => `${getSiteUrl()}#website`;
export const getReturnPolicyId = () => `${getSiteUrl()}/return#merchant-return-policy`;

export const buildOrganizationSchema = (): JsonLd =>
  compactJsonLd({
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    "@id": getOrganizationId(),
    name: SITE_NAME,
    url: getSiteUrl(),
    logo: toAbsoluteUrl("/images/logo.png"),
    image: toAbsoluteUrl("/images/logo.png"),
    description: SITE_DESCRIPTION,
    email: SITE_EMAIL,
    telephone: SITE_PHONE,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Ring Road",
      addressLocality: "Surat",
      addressRegion: "Gujarat",
      postalCode: "395002",
      addressCountry: "IN",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      telephone: SITE_PHONE,
      email: SITE_EMAIL,
      availableLanguage: ["en", "hi"],
    },
    hasMerchantReturnPolicy: {
      "@type": "MerchantReturnPolicy",
      "@id": getReturnPolicyId(),
      applicableCountry: "IN",
      returnPolicyCountry: "IN",
      returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
      merchantReturnDays: 30,
      returnMethod: "https://schema.org/ReturnByMail",
      refundType: "https://schema.org/FullRefund",
      merchantReturnLink: toAbsoluteUrl("/return"),
    },
  }) as JsonLd;

export const buildWebsiteSchema = (): JsonLd =>
  compactJsonLd({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": getWebsiteId(),
    name: SITE_NAME,
    url: getSiteUrl(),
    publisher: {
      "@id": getOrganizationId(),
    },
    potentialAction: {
      "@type": "SearchAction",
      target: `${getSiteUrl()}/shop?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  }) as JsonLd;

export const buildBreadcrumbSchema = (items: BreadcrumbItem[]): JsonLd =>
  compactJsonLd({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url || (item.path ? toAbsoluteUrl(item.path) : undefined),
    })),
  }) as JsonLd;

export const buildProductItemListSchema = (
  id: string,
  name: string,
  products: SchemaProduct[]
): JsonLd =>
  compactJsonLd({
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": id,
    name,
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => {
      const productUrl = toAbsoluteUrl(getProductPath(product));
      return {
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Product",
          "@id": `${productUrl}#product`,
          name: product.name,
          url: productUrl,
          image: toAbsoluteUrl(product.mainImage),
        },
      };
    }),
  }) as JsonLd;

export const buildCollectionPageSchema = ({
  name,
  description,
  path,
  products,
}: {
  name: string;
  description: string;
  path: string;
  products: SchemaProduct[];
}): JsonLd =>
  compactJsonLd({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${toAbsoluteUrl(path)}#collection`,
    name,
    description,
    url: toAbsoluteUrl(path),
    isPartOf: {
      "@id": getWebsiteId(),
    },
    mainEntity: buildProductItemListSchema(`${toAbsoluteUrl(path)}#products`, name, products),
  }) as JsonLd;

export const buildProductSchema = (
  product: SchemaProduct,
  selectedVariant?: SchemaProductVariant
): JsonLd => {
  const productUrl = toAbsoluteUrl(getProductPath(product));
  const activePrice = selectedVariant?.price ?? product.price;
  const activeStock = selectedVariant?.stock ?? product.stock;
  const activeSku = selectedVariant?.sku || product.sku || product._id;
  const imageUrls = uniqueUrls([
    selectedVariant?.image,
    ...(selectedVariant?.images || []),
    product.mainImage,
    ...(product.images || []),
  ]);

  const additionalProperty = [
    ...Object.entries(product.specifications || {}).map(([name, value]) => ({
      "@type": "PropertyValue",
      name,
      value,
    })),
    ...Object.entries(selectedVariant?.options || {}).map(([name, value]) => ({
      "@type": "PropertyValue",
      name,
      value,
    })),
  ];

  return compactJsonLd({
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${productUrl}#product`,
    name: product.name,
    description: cleanText(product.description, SITE_DESCRIPTION),
    image: imageUrls,
    sku: activeSku,
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
    manufacturer: {
      "@id": getOrganizationId(),
    },
    category: product.category?.name,
    additionalProperty,
    weight: product.shippingDimensions?.weight
      ? {
          "@type": "QuantitativeValue",
          value: product.shippingDimensions.weight,
          unitCode: "KGM",
        }
      : undefined,
    height: product.shippingDimensions?.height
      ? {
          "@type": "QuantitativeValue",
          value: product.shippingDimensions.height,
          unitCode: "CMT",
        }
      : undefined,
    width: product.shippingDimensions?.width
      ? {
          "@type": "QuantitativeValue",
          value: product.shippingDimensions.width,
          unitCode: "CMT",
        }
      : undefined,
    depth: product.shippingDimensions?.length
      ? {
          "@type": "QuantitativeValue",
          value: product.shippingDimensions.length,
          unitCode: "CMT",
        }
      : undefined,
    offers: {
      "@type": "Offer",
      "@id": `${productUrl}#offer`,
      url: productUrl,
      priceCurrency: DEFAULT_CURRENCY,
      price: asPrice(activePrice),
      availability: getAvailability(activeStock),
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@id": getOrganizationId(),
      },
      hasMerchantReturnPolicy: {
        "@id": getReturnPolicyId(),
      },
    },
  }) as JsonLd;
};
