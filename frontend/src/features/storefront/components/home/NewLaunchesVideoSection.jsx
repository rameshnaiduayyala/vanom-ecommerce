import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Play,
  Volume2,
  VolumeX,
  Sparkles,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  X,
  CheckCircle2,
} from "lucide-react";
import { useCartStore } from "../../../../stores/cart.store.js";
import { useCountryStore } from "../../../../stores/country.store.js";
import { formatPrice } from "../../../../utils/formatters.js";
import { ROUTES } from "../../../../constants/routes.js";

const NEW_LAUNCH_STORIES = [
  {
    id: "story-1",
    authorName: "Ananya Sharma",
    authorRole: "Verified Buyer • Organic Living",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    videoThumbnail: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-woman-applying-cosmetic-cream-on-her-face-41315-large.mp4",
    title: "How I transformed my morning wellness ritual",
    likes: "4.8k",
    product: {
      id: "prod-launch-1",
      name: "Cold-Pressed Himalayan Shilajit Resin (Gold Grade)",
      category: "Wellness & Vitality",
      price: 1499,
      mrp: 2499,
      discount: 40,
      rating: 4.9,
      reviewsCount: 1240,
      image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80",
      tag: "NEW LAUNCH",
    },
  },
  {
    id: "story-2",
    authorName: "Dr. Rohan Verma",
    authorRole: "Holistic Health Coach",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    videoThumbnail: "https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=600&q=80",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-liquid-being-poured-into-a-glass-jar-42340-large.mp4",
    title: "Pure Raw Wild Forest Honey review & lab testing",
    likes: "6.2k",
    product: {
      id: "prod-launch-2",
      name: "Wild Organic Sundarbans Forest Honey 500g",
      category: "Superfoods",
      price: 699,
      mrp: 999,
      discount: 30,
      rating: 4.8,
      reviewsCount: 890,
      image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=400&q=80",
      tag: "100% RAW",
    },
  },
  {
    id: "story-3",
    authorName: "Pooja Hegde",
    authorRole: "Skincare Enthusiast",
    authorAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
    videoThumbnail: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-putting-serum-on-the-face-with-a-dropper-41314-large.mp4",
    title: "7-Day glow challenge with 24K Kumkumadi Tailam",
    likes: "9.5k",
    product: {
      id: "prod-launch-3",
      name: "Ayurvedic 24K Saffron Kumkumadi Facial Glow Oil",
      category: "Pure Skincare",
      price: 1899,
      mrp: 2999,
      discount: 36,
      rating: 5.0,
      reviewsCount: 2150,
      image: "https://images.unsplash.com/photo-1608248597359-009a25b12a21?auto=format&fit=crop&w=400&q=80",
      tag: "EDITOR'S PICK",
    },
  },
  {
    id: "story-4",
    authorName: "Kunal Mehra",
    authorRole: "Fitness & Nutritionist",
    authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    videoThumbnail: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-fresh-vegetable-salad-in-a-bowl-42337-large.mp4",
    title: "Why cold pressed virgin A2 Gir Cow Ghee is unmatched",
    likes: "3.9k",
    product: {
      id: "prod-launch-4",
      name: "Vedic Bilona A2 Desi Gir Cow Cultured Ghee 1L",
      category: "Vedic Kitchen",
      price: 1599,
      mrp: 2199,
      discount: 27,
      rating: 4.9,
      reviewsCount: 3410,
      image: "https://images.unsplash.com/photo-1589927986089-35812388d1f4?auto=format&fit=crop&w=400&q=80",
      tag: "NEW LAUNCH",
    },
  },
];

export function NewLaunchesVideoSection() {
  const scrollRef = useRef(null);
  const [activeStory, setActiveStory] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [addedItem, setAddedItem] = useState(null);

  const { addToCart } = useCartStore();
  const { country } = useCountryStore();

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 340, behavior: "smooth" });
  };

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    });
    setAddedItem(product.id);
    setTimeout(() => setAddedItem(null), 2000);
  };

  return (
    <section className="py-12 px-4 sm:px-8 lg:px-12 bg-transparent select-none">
      <div className="max-w-[1440px] mx-auto">
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#006B3C]/10 text-[#006B3C] text-xs font-bold uppercase tracking-wider mb-2 border border-[#006B3C]/20">
              <Sparkles className="w-3.5 h-3.5 text-[#D9A514]" />
              <span>Real Customer Stories & New Launches</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#003D2B] tracking-tight">
              Watch. Experience. Shop.
            </h2>
            <p className="text-xs sm:text-sm text-[#345547] mt-1">
              See authentic reviews and unboxings of our newest releases directly from customers.
            </p>
          </div>

          {/* Navigation controls */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => scroll(-1)}
              aria-label="Scroll left"
              className="w-9 h-9 rounded-full bg-white border border-[#ebdcb0] hover:bg-[#003D2B] hover:text-white text-gray-700 shadow-sm flex items-center justify-center transition-all cursor-pointer hover:scale-105"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll(1)}
              aria-label="Scroll right"
              className="w-9 h-9 rounded-full bg-white border border-[#ebdcb0] hover:bg-[#003D2B] hover:text-white text-gray-700 shadow-sm flex items-center justify-center transition-all cursor-pointer hover:scale-105"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video Cards Reel */}
        <div
          ref={scrollRef}
          className="flex items-stretch gap-5 overflow-x-auto scrollbar-none pb-4 pt-1 px-1"
        >
          {NEW_LAUNCH_STORIES.map((story) => (
            <div
              key={story.id}
              className="min-w-[280px] sm:min-w-[320px] max-w-[320px] rounded-3xl overflow-hidden bg-white border border-[#ebdcb0] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group shrink-0"
            >
              {/* Top: Video Thumbnail & Play Trigger */}
              <div
                onClick={() => setActiveStory(story)}
                className="relative h-72 sm:h-80 w-full overflow-hidden cursor-pointer bg-black/90"
              >
                <img
                  src={story.videoThumbnail}
                  alt={story.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                />

                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

                {/* Top Badge & Author */}
                <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10">
                  <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 text-white text-[11px] font-medium">
                    <img
                      src={story.authorAvatar}
                      alt={story.authorName}
                      className="w-5 h-5 rounded-full object-cover border border-white"
                    />
                    <span className="truncate max-w-[110px]">{story.authorName}</span>
                  </div>

                  <span className="bg-[#D9A514] text-[#003D2B] text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                    {story.product.tag}
                  </span>
                </div>

                {/* Center Play Button Pulse */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-13 h-13 rounded-full bg-white/30 backdrop-blur-md border border-white/60 flex items-center justify-center text-white group-hover:bg-[#006B3C] group-hover:scale-115 transition-all duration-300 shadow-xl">
                    <Play className="w-6 h-6 fill-white ml-1" />
                  </div>
                </div>

                {/* Bottom Story Title */}
                <div className="absolute bottom-3 left-3.5 right-3.5 text-white z-10">
                  <p className="text-xs font-bold leading-snug line-clamp-2 drop-shadow-sm">
                    &ldquo;{story.title}&rdquo;
                  </p>
                  <div className="flex items-center gap-1.5 mt-1 text-[10px] text-white/80">
                    <CheckCircle2 className="w-3 h-3 text-[#54BC8C]" />
                    <span>{story.authorRole}</span>
                  </div>
                </div>
              </div>

              {/* Bottom: Attached Product Card */}
              <div className="p-3.5 bg-gradient-to-b from-white to-[#FFFDF5] flex-1 flex flex-col justify-between border-t border-[#ebdcb0]/60">
                <div className="flex gap-3 items-center">
                  <img
                    src={story.product.image}
                    alt={story.product.name}
                    className="w-14 h-14 rounded-xl object-cover border border-[#ebdcb0] shrink-0 bg-white p-0.5 shadow-2xs"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-[#006B3C] uppercase tracking-wider">
                      {story.product.category}
                    </span>
                    <h4 className="text-xs font-bold text-gray-900 truncate" title={story.product.name}>
                      {story.product.name}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs font-black text-[#003D2B]">
                        {formatPrice(story.product.price, country.currency, country.symbol)}
                      </span>
                      {story.product.mrp && (
                        <span className="text-[10px] text-gray-400 line-through">
                          {formatPrice(story.product.mrp, country.currency, country.symbol)}
                        </span>
                      )}
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded">
                        {story.product.discount}% off
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={(e) => handleAddToCart(e, story.product)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                      addedItem === story.product.id
                        ? "bg-emerald-600 text-white"
                        : "bg-[#003D2B] hover:bg-[#00291D] text-white hover:shadow-md"
                    }`}
                  >
                    {addedItem === story.product.id ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Added!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>

                  <Link
                    to={`${ROUTES.PRODUCTS}/${story.product.id}`}
                    className="p-2 rounded-xl border border-[#ebdcb0] hover:bg-white text-gray-700 hover:text-[#003D2B] transition-colors flex items-center justify-center cursor-pointer"
                    title="View Product"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Interactive Video Modal Popup ── */}
      {activeStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm sm:max-w-md bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/20 flex flex-col">
            {/* Close Button */}
            <button
              onClick={() => setActiveStory(null)}
              aria-label="Close video"
              className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 flex items-center justify-center hover:bg-black transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Video Player */}
            <div className="relative w-full aspect-[9/16] max-h-[65vh] bg-black flex items-center justify-center overflow-hidden">
              <video
                src={activeStory.videoUrl}
                poster={activeStory.videoThumbnail}
                autoPlay
                playsInline
                loop
                muted={isMuted}
                className="w-full h-full object-cover"
              />

              {/* Sound toggle button */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="absolute bottom-4 right-4 z-20 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center border border-white/20 hover:bg-black transition-colors cursor-pointer"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {/* Creator Tag in Video */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 text-white text-xs">
                <img
                  src={activeStory.authorAvatar}
                  alt={activeStory.authorName}
                  className="w-6 h-6 rounded-full object-cover border border-white/80"
                />
                <div>
                  <p className="font-bold leading-tight">{activeStory.authorName}</p>
                  <p className="text-[10px] text-white/70">{activeStory.authorRole}</p>
                </div>
              </div>
            </div>

            {/* Modal Product Buy Footer */}
            <div className="p-4 bg-[#1a3c2e] text-white border-t border-white/10 flex items-center gap-3">
              <img
                src={activeStory.product.image}
                alt={activeStory.product.name}
                className="w-13 h-13 rounded-xl object-cover bg-white p-0.5 border border-white/20 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h5 className="text-xs font-bold truncate text-white">
                  {activeStory.product.name}
                </h5>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm font-black text-[#F9BC15]">
                    {formatPrice(activeStory.product.price, country.currency, country.symbol)}
                  </span>
                  <span className="text-[10px] text-white/50 line-through">
                    {formatPrice(activeStory.product.mrp, country.currency, country.symbol)}
                  </span>
                </div>
              </div>
              <button
                onClick={(e) => handleAddToCart(e, activeStory.product)}
                className="px-4 py-2.5 rounded-xl bg-[#F9BC15] hover:bg-[#e5ab10] text-[#003D2B] font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Buy Now</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default NewLaunchesVideoSection;
