import React from "react";

const BRANDS = [
  { name: "Samsung", logo: "https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg" },
  { name: "boAt", logo: "https://upload.wikimedia.org/wikipedia/commons/8/8c/BoAt_logo.png" },
  { name: "Philips", logo: "https://upload.wikimedia.org/wikipedia/commons/b/bf/Philips_logo_new.svg" },
  { name: "Xiaomi", logo: "https://upload.wikimedia.org/wikipedia/commons/2/29/Xiaomi_logo.svg" },
  { name: "HP", logo: "https://upload.wikimedia.org/wikipedia/commons/a/ad/HP_logo_2012.svg" },
  { name: "Lenovo", logo: "https://upload.wikimedia.org/wikipedia/commons/b/b8/Lenovo_logo_2015.svg" },
];

export function BrandBadgeStrip({ brands = BRANDS }) {
  return (
    <section className="py-8 bg-white border-y border-gray-100">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
        <h2 className="text-xl font-black text-gray-900 mb-5 text-center">Top Brands</h2>
        <div className="flex items-center justify-center flex-wrap gap-4 sm:gap-8">
          {(brands.length > 0 ? brands : BRANDS).map((brand) => (
            <div
              key={brand.name}
              className="flex items-center justify-center h-12 w-28 px-4 grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all cursor-pointer"
            >
              {brand.logo ? (
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="max-h-8 max-w-full object-contain"
                  onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
                />
              ) : null}
              <span
                className="hidden text-lg font-black text-gray-700"
                style={{ display: "none" }}
              >
                {brand.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default BrandBadgeStrip;
