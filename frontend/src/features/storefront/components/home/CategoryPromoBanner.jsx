import React from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../../../constants/routes.js";

/**
 * CategoryPromoBanner — Reusable Category Advertisement Banner
 * Renders ONLY when a category has a banner image configured.
 * If no banner image exists, returns null (clean, no default fallback banners).
 *
 * @param {Object} props
 * @param {Object} props.category - The main category object
 * @param {Object} [props.banner] - Optional banner overrides
 * @param {string} [props.className] - Extra Tailwind styling
 */
export function CategoryPromoBanner({
  category,
  banner = null,
  className = "",
}) {
  if (!category) return null;

  const categoryName = category.name || "Special Collection";
  const categorySlug = category.slug || category.id;

  // Check if a direct banner artwork is uploaded on this category or passed in banner prop
  const bannerImage =
    category.categoryBannerImage ||
    category.bannerImage ||
    banner?.bannerImage ||
    banner?.imageUrl;

  // STRICT REQUIREMENT: If no banner image is provided, do NOT show any banner
  if (!bannerImage) {
    return null;
  }

  const ctaLink =
    banner?.ctaLink ||
    `${ROUTES.PRODUCTS}?category=${encodeURIComponent(categorySlug)}`;

  const ctaText = banner?.ctaText || "Shop Now";

  return (
    <section
      className={`group relative w-full overflow-hidden rounded-xl sm:rounded-2xl bg-[#06452B] shadow-xs transition-all duration-300 hover:shadow-md ${className}`}
    >
      <Link
        to={ctaLink}
        aria-label={`${ctaText} - ${categoryName}`}
        className="relative block w-full overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
      >
        <img
          src={bannerImage}
          alt={categoryName}
          loading="lazy"
          className="block w-full h-auto object-contain transition-transform duration-500 group-hover:scale-[1.008]"
        />
      </Link>
    </section>
  );
}

export default CategoryPromoBanner;
