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
  LayoutTemplate,
  Layers,
  ArrowRight,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminCategories } from "../categories/hooks/useAdminCategories.js";
import { CategoryFormModal } from "../categories/components/CategoryFormModal.jsx";
import { HeroBannerFormModal } from "./HeroBannerFormModal.jsx";
import { Button } from "@/components/ui/Button.jsx";
import { ConfirmDialog } from "@/components/ui/Alert.jsx";
import { ROUTES } from "@/constants/routes.js";
import { Link } from "react-router-dom";
import { storeService } from "@/services/api/store.service.js";
import { catalogService } from "@/services/api/catalog.service.js";
import { useStoreSettingsStore } from "@/stores/store.store.js";

export function AdminAdvertisementsPage() {
  const queryClient = useQueryClient();
  const { categories, isLoading: loadingCategories, updateMutation } = useAdminCategories();
  const [activeTab, setActiveTab] = useState("hero"); // "hero" | "categories"

  // ── Category Banners State ──
  const [editingCategory, setEditingCategory] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [removingBannerCategory, setRemovingBannerCategory] = useState(null);

  // ── Hero Banners State ──
  const [isHeroModalOpen, setIsHeroModalOpen] = useState(false);
  const [editingHeroSlide, setEditingHeroSlide] = useState(null);
  const [editingHeroIndex, setEditingHeroIndex] = useState(-1);
  const [deletingHeroIndex, setDeletingHeroIndex] = useState(null);

  // Fetch Store Settings for Hero Banners
  const { data: storeData, isLoading: loadingStore } = useQuery({
    queryKey: ["admin-store-settings"],
    queryFn: () => storeService.getStoreSettings(),
  });

  // Fetch Products for the Link picker using fast lightweight dropdown API
  const { data: productsData } = useQuery({
    queryKey: ["admin-products-dropdown"],
    queryFn: () => catalogService.getProductsDropdown({ limit: 500 }),
    staleTime: 5 * 60 * 1000,
  });

  const productsList = productsData || [];
  const heroBanners = Array.isArray(storeData?.metadata?.heroBanners)
    ? storeData.metadata.heroBanners
    : [];

  // Update Store mutation for saving hero banners
  const updateStoreMutation = useMutation({
    mutationFn: (newMetadata) => storeService.updateStoreSettings({ metadata: newMetadata }),
    onSuccess: (updated) => {
      queryClient.setQueryData(["admin-store-settings"], updated);
      useStoreSettingsStore.getState().setStore(updated);
      useStoreSettingsStore.getState().fetchPublicStore(true);
    },
  });

  // ── Handlers for Hero Banners ──
  const handleOpenAddHeroBanner = () => {
    setEditingHeroSlide(null);
    setEditingHeroIndex(-1);
    setIsHeroModalOpen(true);
  };

  const handleEditHeroBanner = (slide, index) => {
    setEditingHeroSlide(slide);
    setEditingHeroIndex(index);
    setIsHeroModalOpen(true);
  };

  const handleSaveHeroBanner = (savedSlide, index) => {
    let nextBanners = [...heroBanners];
    if (index >= 0 && index < nextBanners.length) {
      nextBanners[index] = savedSlide;
    } else {
      nextBanners.push(savedSlide);
    }

    const currentMeta = storeData?.metadata || {};
    updateStoreMutation.mutate({
      ...currentMeta,
      heroBanners: nextBanners,
    });
  };

  const handleDeleteHeroBannerConfirm = () => {
    if (deletingHeroIndex === null) return;
    const nextBanners = heroBanners.filter((_, idx) => idx !== deletingHeroIndex);
    const currentMeta = storeData?.metadata || {};
    updateStoreMutation.mutate(
      {
        ...currentMeta,
        heroBanners: nextBanners,
      },
      {
        onSuccess: () => setDeletingHeroIndex(null),
      }
    );
  };

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

  const mainCategories = categories.filter((c) => !c.parentId);
  const categoriesWithBanner = mainCategories.filter((c) => getCategoryBanners(c).length > 0);
  const categoriesWithoutBanner = mainCategories.filter((c) => getCategoryBanners(c).length === 0);

  const handleEditCategoryBanner = (cat) => {
    setEditingCategory(cat);
    setIsCategoryModalOpen(true);
  };

  const handleRemoveCategoryBannerConfirm = () => {
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
                Storefront Advertisements &amp; Banners
              </h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#0B4627]">
                Live Storefront
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage Home Page Hero Slider Carousel & Category Showcase Banners with custom links to products or categories.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === "hero" ? (
            <Button
              onClick={handleOpenAddHeroBanner}
              className="bg-[#00875A] hover:bg-[#00744D] text-white font-bold inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Hero Banner</span>
            </Button>
          ) : (
            <Link
              to={ROUTES.ADMIN.CATEGORIES}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
            >
              <FolderTree className="w-4 h-4" />
              <span>All Categories</span>
            </Link>
          )}
        </div>
      </div>

      {/* ── Tabs Selector: Hero Banner Carousel vs Category Banners ── */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-1">
        <button
          type="button"
          onClick={() => setActiveTab("hero")}
          className={`pb-3 px-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "hero"
              ? "border-[#00875A] text-[#00875A]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <LayoutTemplate className="w-4 h-4" />
          <span>Home Hero Banner Carousel ({heroBanners.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("categories")}
          className={`pb-3 px-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "categories"
              ? "border-[#00875A] text-[#00875A]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Category Showcase Banners ({categoriesWithBanner.length})</span>
        </button>
      </div>

      {/* ════════════ TAB 1: HERO BANNER CAROUSEL ════════════ */}
      {activeTab === "hero" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Main Page Hero Banner Carousel ({heroBanners.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                These slides appear at the very top of the Vanom Home Page. If empty, the default editorial banners are displayed.
              </p>
            </div>
            <Button
              size="sm"
              onClick={handleOpenAddHeroBanner}
              className="bg-[#00875A] hover:bg-[#00744D] text-white font-bold inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Slide</span>
            </Button>
          </div>

          {loadingStore ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              Loading hero carousel banners...
            </div>
          ) : heroBanners.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-[#00875A] flex items-center justify-center mx-auto">
                <LayoutTemplate className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-sm font-bold text-slate-800">No Custom Hero Slides Added Yet</h3>
                <p className="text-xs text-slate-500">
                  The storefront is currently showing default curated superfood slides. Click below to add your custom promotional carousel slide with a direct product or category link.
                </p>
              </div>
              <Button
                onClick={handleOpenAddHeroBanner}
                className="bg-[#00875A] hover:bg-[#00744D] text-white font-bold"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Add Your First Hero Banner
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {heroBanners.map((slide, idx) => (
                <div
                  key={slide.id || idx}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col group hover:shadow-md transition-all"
                >
                  {/* Banner Image Preview */}
                  <div className="relative aspect-[16/8] bg-slate-100 overflow-hidden">
                    <img
                      src={slide.image}
                      alt={slide.titleLine1 || "Hero Slide"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = "/hero-banner-main.jpg";
                      }}
                    />

                    {/* Slide Sequence Badge */}
                    <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <span>Slide #{idx + 1}</span>
                    </div>

                    {/* Destination Badge */}
                    <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-md bg-emerald-950/80 backdrop-blur-md text-emerald-200 text-[10px] font-bold flex items-center gap-1.5 border border-emerald-500/30">
                      <ExternalLink className="w-3 h-3 text-emerald-400" />
                      <span className="truncate max-w-[140px]">{slide.ctaLink || "/products"}</span>
                    </div>
                  </div>

                  {/* Slide Content Details */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-1">
                        {slide.titleLine1} {slide.titleLine2} {slide.titleLine3} {slide.titleLine4}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {slide.description || "No description provided."}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00875A] bg-emerald-50 px-2.5 py-1 rounded-lg">
                        <span>{slide.ctaText || "Shop Now"}</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditHeroBanner(slide, idx)}
                          className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                          title="Edit slide"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingHeroIndex(idx)}
                          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          title="Remove slide"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ════════════ TAB 2: CATEGORY BANNERS ════════════ */}
      {activeTab === "categories" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-800">
              Active Category Showcases ({categoriesWithBanner.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              These promotional banners appear above product grids for each category on the home page.
            </p>
          </div>

          {loadingCategories ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              Loading category advertisements...
            </div>
          ) : categoriesWithBanner.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <ImageIcon className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-700">No Category Banners Configured</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Select a category from the list below to upload promotional banners.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoriesWithBanner.map((cat) => {
                const banners = getCategoryBanners(cat);
                const isMultiSlide = banners.length > 1;

                return (
                  <div
                    key={cat.id}
                    className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col group hover:shadow-md transition-all"
                  >
                    <div className="relative aspect-[16/7] bg-slate-100 overflow-hidden">
                      <img
                        src={banners[0]}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src = "/hero-banner-main.jpg";
                        }}
                      />

                      <div className="absolute top-2 left-2 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                        <span>Live on Home</span>
                      </div>

                      {isMultiSlide && (
                        <div className="absolute top-2 right-2 px-2.5 py-1 rounded-md bg-emerald-950/80 backdrop-blur-md text-emerald-200 text-[10px] font-bold flex items-center gap-1.5 shadow-sm border border-emerald-500/30">
                          <Images className="w-3 h-3 text-emerald-400" />
                          <span>{banners.length} Slides</span>
                        </div>
                      )}
                    </div>

                    <div className="p-4 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-800 truncate">{cat.name}</h3>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          Slug: /{cat.slug} • {banners.length} {banners.length === 1 ? "Banner" : "Banners"}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleEditCategoryBanner(cat)}
                          className="inline-flex items-center gap-1 text-xs font-bold"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Manage</span>
                        </Button>
                        <button
                          type="button"
                          onClick={() => setRemovingBannerCategory(cat)}
                          className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                          title="Remove banners"
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

          {/* Categories pending banner setup */}
          {categoriesWithoutBanner.length > 0 && (
            <div className="space-y-4 pt-4">
              <h2 className="text-base font-bold text-slate-800">
                Other Categories Available ({categoriesWithoutBanner.length})
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {categoriesWithoutBanner.map((cat) => (
                  <div
                    key={cat.id}
                    className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between gap-3 hover:border-emerald-500/50 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 text-[#0B4627] font-bold text-sm flex items-center justify-center shrink-0">
                        {cat.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-800 truncate">{cat.name}</h4>
                        <span className="text-[10px] text-slate-400">No banner artwork</span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditCategoryBanner(cat)}
                      className="text-xs font-bold shrink-0 text-[#00875A] border-[#00875A]/30 hover:bg-emerald-50"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Add Banner
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Category Banner Edit Modal ── */}
      {editingCategory && (
        <CategoryFormModal
          isOpen={isCategoryModalOpen}
          onClose={() => {
            setIsCategoryModalOpen(false);
            setEditingCategory(null);
          }}
          editingCategory={editingCategory}
          categories={categories}
          onSubmit={(data) => {
            updateMutation.mutate(
              { id: editingCategory.id, data },
              {
                onSuccess: () => {
                  setIsCategoryModalOpen(false);
                  setEditingCategory(null);
                },
              }
            );
          }}
          isPending={updateMutation.isPending}
        />
      )}

      {/* ── Hero Banner Add/Edit Modal ── */}
      <HeroBannerFormModal
        isOpen={isHeroModalOpen}
        onClose={() => {
          setIsHeroModalOpen(false);
          setEditingHeroSlide(null);
          setEditingHeroIndex(-1);
        }}
        editingSlide={editingHeroSlide}
        slideIndex={editingHeroIndex}
        categories={categories}
        products={productsList}
        onSave={handleSaveHeroBanner}
      />

      {/* ── Confirm Delete Hero Banner Dialog ── */}
      <ConfirmDialog
        isOpen={deletingHeroIndex !== null}
        onClose={() => setDeletingHeroIndex(null)}
        onConfirm={handleDeleteHeroBannerConfirm}
        title="Remove Hero Slide?"
        message="Are you sure you want to remove this hero slide from the home page carousel?"
        confirmText="Remove Slide"
        confirmVariant="danger"
      />

      {/* ── Confirm Delete Category Banner Dialog ── */}
      <ConfirmDialog
        isOpen={Boolean(removingBannerCategory)}
        onClose={() => setRemovingBannerCategory(null)}
        onConfirm={handleRemoveCategoryBannerConfirm}
        title="Remove Category Banners?"
        message={`Are you sure you want to remove all advertisement banners for "${removingBannerCategory?.name}"?`}
        confirmText="Remove Banners"
        confirmVariant="danger"
      />
    </div>
  );
}

export default AdminAdvertisementsPage;
