import React from "react";
import { Helmet } from "react-helmet-async";

/**
 * Reusable SEO component for dynamic metadata, Open Graph, Twitter Cards, and Schema.org JSON-LD
 */
export function SEO({
  title = "Vanom E-Commerce | Global Organic & Wholesale Superstore",
  description = "Shop certified organic essentials, value combos, and wholesale goods at Vanom. Fast global delivery, authentic products, and 100% purchase protection.",
  keywords = "ecommerce, organic groceries, value combos, wholesale, spices, nutrition, vanom",
  canonical,
  ogType = "website",
  ogImage = "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=1200&q=80",
  schema,
  noindex = false,
}) {
  const currentUrl = typeof window !== "undefined" ? window.location.href : "https://vanom.com";
  const finalCanonical = canonical || currentUrl;
  const siteTitle = title.includes("Vanom") ? title : `${title} | Vanom Store`;

  return (
    <Helmet>
      {/* Primary HTML Meta Tags */}
      <title>{siteTitle}</title>
      <meta name="title" content={siteTitle} />
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={finalCanonical} />
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={finalCanonical} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="Vanom" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={finalCanonical} />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Structured JSON-LD Data for Rich Snippets */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}

export default SEO;
