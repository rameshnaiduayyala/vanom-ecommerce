import React, { useState } from "react";
import {
  Megaphone,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Image as ImageIcon,
  CheckCircle,
  FolderTree,
  Images,
} from "lucide-react";
import { useAdminCategories } from "../categories/hooks/useAdminCategories.js";
import { CategoryFormModal } from "../categories/components/CategoryFormModal.jsx";
import { Button } from "@/components/ui/Button.jsx";
import { ConfirmDialog } from "@/components/ui/Alert.jsx";
import { ROUTES } from "@/constants/routes.js";
import { Link } from "react-router-dom";

export function AdminAdvertisementsPage() {
  const { categories, isLoading, updateMutation } = useAdminCategories();
  const [editingCategory, setEditingCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [removingBannerCategory, setRemovingBannerCategory] = useState(null);

  // Helper to extract banner images array from a category
  const getCategoryBanners = (cat) => {
    if (!cat) return [];
    if (Array.isArray(cat.categoryBannerImages) && cat.categoryBannerImages.length > 0) {
      return cat.categoryBannerImages.filter(Boolean);
    }
    const raw = cat.categoryBannerImage;
    if (typeof raw === "string" && raw.trim()) {
      const trimmed = raw.trim();
      if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) return parsed.filter(Boolean);
        } catch {}
      }
      return [trimmed];
    }
    return [];
  };

  // Focus primarily on Root / Main Categories that appear on the storefront
  const mainCategories = categories.filter((c) => !c.parentId);
  const categoriesWithBanner = mainCategories.filter((c) => getCategoryBanners(c).length > 0);
  const categoriesWithoutBanner = mainCategories.filter((c) => getCategoryBanners(c).length === 0);

  const handleEditBanner = (cat) => {
    setEditingCategory(cat);
    setIsModalOpen(true);
  };

  const handleRemoveBannerConfirm = () => {
    if (!removingBannerCategory) return;
    updateMutation.mutate(
      {
        id: removingBannerCategory.id,
        data: {
          categoryBannerImage: null,
          categoryBannerImages: [],
        },
      },
      {
        onSuccess: () => setRemovingBannerCategory(null),
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0B4627] to-[#1E3B2B] text-white flex items-center justify-center shadow-sm">
            <Megaphone className="w-6 h-6 text-[#FCE182]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                Category Advertisements &amp; Banners
              </h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#0B4627]">
                Storefront
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload single or multiple promotional banners per main category. Multiple images will automatically scroll smoothly on the home page showcase.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={ROUTES.ADMIN.CATEGORIES}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
          >
            <FolderTree className="w-4 h-4" />
            <span>All Categories</span>
          </Link>
        </div>
      </div>

      {/* ── Active Category Banners Grid ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-800">
              Active Category Showcases ({categoriesWithBanner.length})
            </h2>
            <span className="text-xs text-slate-400">
              Auto-scrolls when 2+ slides are configured
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-44 bg-white rounded-2xl border border-slate-200 animate-pulse p-4" />
            ))}
          </div>
        ) : categoriesWithBanner.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center space-y-3">
            <ImageIcon className="w-10 h-10 text-slate-400 mx-auto opacity-60" />
            <h3 className="text-sm font-bold text-slate-700">No Category Banners Assigned Yet</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Select one of the main categories below to upload multiple banner artworks and enable the auto-scrolling hero showcase on your storefront.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {categoriesWithBanner.map((cat) => {
              const banners = getCategoryBanners(cat);
              const isMultiSlide = banners.length > 1;

              return (
                <div
                  key={cat.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col group hover:shadow-md transition-all duration-200"
                >
                  {/* Banner Artwork Preview */}
                  <div className="relative w-full aspect-[21/9] sm:aspect-[3.5/1] bg-slate-900 overflow-hidden">
                    <img
                      src={banners[0]}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                    />

                    {/* Live Badge */}
                    <div className="absolute top-2 left-2 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                      <span>Live on Home</span>
                    </div>

                    {/* Multi-slide Auto-scroll Indicator Badge */}
                    {isMultiSlide && (
                      <div className="absolute top-2 right-2 px-2.5 py-1 rounded-md bg-emerald-950/80 backdrop-blur-md text-emerald-200 text-[10px] font-bold flex items-center gap-1.5 shadow-sm border border-emerald-500/30">
                        <Images className="w-3 h-3 text-emerald-400" />
                        <span>{banners.length} Slides • Auto-scroll</span>
                      </div>
                    )}

                    {/* Carousel Thumbnail Dots Preview */}
                    {isMultiSlide && (
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-xs">
                        {banners.map((_, dotIdx) => (
                          <span
                            key={dotIdx}
                            className={`rounded-full ${
                              dotIdx === 0
                                ? "w-3.5 h-1.5 bg-white"
                                : "w-1.5 h-1.5 bg-white/50"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Banner Details & Controls */}
                  <div className="p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-800 truncate">{cat.name}</h3>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        Slug: /{cat.slug} • {banners.length} {banners.length === 1 ? "Banner" : "Banners (Auto-scroll)"} • {cat.children?.length || 0} Subcategories
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEditBanner(cat)}
                        className="inline-flex items-center gap-1 text-xs font-bold"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Manage Banners</span>
                      </Button>
                      <button
                        type="button"
                        onClick={() => setRemovingBannerCategory(cat)}
                        className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                        title="Remove all banners"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Main Categories Pending Banner Setup ── */}
      {categoriesWithoutBanner.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800">
              Other Main Categories ({categoriesWithoutBanner.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categoriesWithoutBanner.map((cat) => (
              <div
                key={cat.id}
                className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between gap-3 hover:border-emerald-500/50 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {cat.imageUrl ? (
                    <img
                      src={cat.imageUrl}
                      alt={cat.name}
                      className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 text-[#0B4627] font-bold text-sm flex items-center justify-center shrink-0">
                      {cat.name.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 truncate">{cat.name}</h4>
                    <span className="text-[10px] text-slate-400">No banner artwork</span>
                  </div>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleEditBanner(cat)}
                  className="shrink-0 text-xs font-bold text-[#0B4627] hover:bg-emerald-50"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  <span>Add Banners</span>
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Edit Category Banner Modal ── */}
      {isModalOpen && (
        <CategoryFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          editingCategory={editingCategory}
          onSubmit={(data) => {
            updateMutation.mutate(
              { id: editingCategory.id, data },
              {
                onSuccess: () => setIsModalOpen(false),
              }
            );
          }}
          isPending={updateMutation.isPending}
          categories={categories}
        />
      )}

      {/* ── Remove Confirmation Dialog ── */}
      {removingBannerCategory && (
        <ConfirmDialog
          isOpen={Boolean(removingBannerCategory)}
          title="Remove Category Banners?"
          message={`Are you sure you want to remove all advertisement banners for "${removingBannerCategory.name}"? The storefront will not display any banner for this category.`}
          confirmLabel="Remove All Banners"
          isDanger={true}
          isLoading={updateMutation.isPending}
          onConfirm={handleRemoveBannerConfirm}
          onCancel={() => setRemovingBannerCategory(null)}
        />
      )}
    </div>
  );
}

export default AdminAdvertisementsPage;
