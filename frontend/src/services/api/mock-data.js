const INITIAL_CATEGORIES = [
  { id: "cat-9", name: "Groceries", slug: "groceries", count: 142, description: "Fresh produce, organic pantry, staples, cold-pressed oils, and superfoods." },
  { id: "cat-1", name: "Electronics", slug: "electronics", count: 245, description: "Laptops, audio, smart watches, tablets and gadgets." },
  { id: "cat-2", name: "Home & Living", slug: "home-and-living", count: 180, description: "Furniture, decor, lighting and indoor plants." },
  { id: "cat-3", name: "Kitchen & Dining", slug: "kitchen-and-dining", count: 120, description: "Air fryers, mixer grinders, cookware and appliances." },
  { id: "cat-4", name: "Beauty & Personal Care", slug: "beauty-and-personal-care", count: 96, description: "Skincare, grooming, fragrance and cosmetics." },
  { id: "cat-5", name: "Health & Wellness", slug: "health-and-wellness", count: 85, description: "Fitness trackers, supplements, organic essentials." },
  { id: "cat-6", name: "Toys & Baby", slug: "toys-and-baby", count: 64, description: "Educational toys, baby care and nursery essentials." },
  { id: "cat-7", name: "Sports & Fitness", slug: "sports-and-fitness", count: 72, description: "Gym equipment, smart wearables and outdoor gear." },
  { id: "cat-8", name: "Stationery & Office", slug: "stationery-and-office", count: 54, description: "Desk setups, notebooks, writing and office supply." },
];

const INITIAL_PRODUCTS = [
  // ─── GROCERIES & ORGANIC ESSENTIALS ───
  {
    id: "kadha-sips-cold-cough",
    name: "Kadha Sips for Cold & Cough Relief",
    slug: "kadha-sips-cold-cough",
    sku: "GROC-KADHA-SIPS-01",
    category: "Groceries",
    categoryId: "cat-9",
    brand: "Dr. Vaidya's",
    rating: 4.85,
    reviewsCount: 1104,
    price: 339,
    mrp: 400,
    discount: 15,
    badge: "Bestseller",
    specs: "Immunity Boost | Soothes Sore Throat | 100% Ayurvedic Sips",
    bgGradient: "from-[#FAF3DF] via-[#F8ECD1] to-[#F3E2BD]",
    image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80",
    ],
    description: "Ayurvedic herbal Kadha sips formulated with Sunthi, Tulsi, Cinnamon, and Black Pepper for instant immunity boosting, throat soothing, and cold defense.",
    stock: 250,
    highlights: [
      { label: "Form", value: "Instant Herbal Sachets" },
      { label: "Benefits", value: "Immunity & Throat Relief" },
      { label: "Ingredients", value: "Tulsi, Sunthi, Dalchini" },
      { label: "Diet Type", value: "100% Vegetarian / Ayurvedic" },
      { label: "Pack Size", value: "30 Sachets" },
    ],
    features: [
      "Instant water-soluble immunity sips with zero refined sugar",
      "Infused with 12 ancient Ayurvedic botanicals",
      "Immediate warmth and soothing relief for scratchy throats",
      "Tested for purity, heavy metals, and safety",
    ],
    specifications: {
      Brand: "Dr. Vaidya's",
      Category: "Groceries & Herbal Health",
      "Pack Type": "Box of 30 Sips",
      "Country of Origin": "India",
      "Shelf Life": "24 Months",
    },
    pricing: {
      IN: { currency: "INR", symbol: "₹", retailPrice: 339, mrp: 400 },
      US: { currency: "USD", symbol: "$", retailPrice: 8.99, mrp: 12.00 },
      CA: { currency: "CAD", symbol: "CA$", retailPrice: 11.99, mrp: 15.00 },
    },
  },
  {
    id: "sungho-inhalant-nasal-decongestion",
    name: "Sungho Inhalant for Nasal Decongestion",
    slug: "sungho-inhalant-nasal-decongestion",
    sku: "GROC-SUNGHO-01",
    category: "Groceries",
    categoryId: "cat-9",
    brand: "Dr. Vaidya's",
    rating: 4.71,
    reviewsCount: 63,
    price: 212,
    mrp: 250,
    discount: 15,
    badge: "Bestseller",
    specs: "Soothing Aroma | Fast Nasal Decongestor | Natural Camphor",
    bgGradient: "from-[#E6EFE6] via-[#DCEADE] to-[#CFE3D2]",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80",
    description: "Traditional herbal aromatic inhalant jar packed with camphor, eucalyptus, and cooling botanicals to quickly clear blocked sinuses and airways.",
    stock: 180,
    highlights: [
      { label: "Usage", value: "Aromatherapy / Inhalant" },
      { label: "Active", value: "Eucalyptus & Camphor" },
      { label: "Safety", value: "Non-habit Forming" },
    ],
    features: [
      "Natural eucalyptus aroma opens respiratory passages in seconds",
      "Convenient compact pocket-sized jar",
      "Pure herbal extracts with zero harmful chemicals",
    ],
    specifications: {
      Brand: "Dr. Vaidya's",
      "Country of Origin": "India",
      "Net Weight": "10 g",
    },
    pricing: {
      IN: { currency: "INR", symbol: "₹", retailPrice: 212, mrp: 250 },
      US: { currency: "USD", symbol: "$", retailPrice: 5.99, mrp: 7.50 },
      CA: { currency: "CAD", symbol: "CA$", retailPrice: 7.99, mrp: 9.99 },
    },
  },
  {
    id: "organic-extra-virgin-olive-oil",
    name: "Cold Pressed Extra Virgin Olive Oil 1L",
    slug: "organic-extra-virgin-olive-oil",
    sku: "GROC-OIL-EVOO-1L",
    category: "Groceries",
    categoryId: "cat-9",
    brand: "OlivaPure",
    rating: 4.88,
    reviewsCount: 2410,
    price: 899,
    mrp: 1299,
    discount: 30,
    badge: "Bestseller",
    specs: "100% First Cold Pressed | High Polyphenols | USDA Certified",
    bgGradient: "from-[#F4F8F0] via-[#E8F3E0] to-[#DCEDD2]",
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80",
    description: "Premium single-origin first cold-pressed extra virgin olive oil from Mediterranean groves. Rich in heart-healthy monounsaturated fats and antioxidants.",
    stock: 140,
    highlights: [
      { label: "Process", value: "First Cold Pressed" },
      { label: "Acidity", value: "< 0.3%" },
      { label: "Volume", value: "1 Litre Glass Bottle" },
    ],
    features: [
      "Ideal for salads, dressings, dips, and light cooking",
      "Unrefined, unbleached, and non-GMO verified",
      "Packed in dark UV-resistant glass bottle to preserve nutrients",
    ],
    specifications: {
      Brand: "OlivaPure",
      "Item Weight": "1.4 kg",
      "Country of Origin": "Spain / India",
      Warranty: "100% Organic Purity Guaranteed",
    },
    pricing: {
      IN: { currency: "INR", symbol: "₹", retailPrice: 899, mrp: 1299 },
      US: { currency: "USD", symbol: "$", retailPrice: 16.99, mrp: 22.99 },
      CA: { currency: "CAD", symbol: "CA$", retailPrice: 22.99, mrp: 29.99 },
    },
  },
  {
    id: "royal-heritage-aged-basmati-rice",
    name: "Royal Heritage Aged Basmati Rice 5kg",
    slug: "royal-heritage-aged-basmati-rice",
    sku: "GROC-RICE-5KG",
    category: "Groceries",
    categoryId: "cat-9",
    brand: "Royal Heritage",
    rating: 4.92,
    reviewsCount: 3820,
    price: 649,
    mrp: 850,
    discount: 24,
    badge: "Bestseller",
    specs: "Aged for 2 Years | Extra Long Grains | Aromatic & Fluffy",
    bgGradient: "from-[#FAF3DF] via-[#F8ECD1] to-[#F3E2BD]",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80",
    description: "Himalayan foothills aged premium Basmati rice. Slender grains elongate up to 2.5x upon cooking, delivering irresistible aroma and non-sticky fluffy texture.",
    stock: 300,
    highlights: [
      { label: "Aging", value: "24 Months Naturally Aged" },
      { label: "Grain", value: "Extra Long 8.4mm" },
      { label: "Weight", value: "5 kg Cloth Bag" },
    ],
    features: [
      "Aged to perfection in climate-controlled silos for intense natural fragrance",
      "Non-sticky, individual separate grains ideal for Biryani and Pulao",
      "100% sortex-cleaned and free from impurities",
    ],
    specifications: {
      Brand: "Royal Heritage",
      "Country of Origin": "India",
      "Net Weight": "5 kg",
    },
    pricing: {
      IN: { currency: "INR", symbol: "₹", retailPrice: 649, mrp: 850 },
      US: { currency: "USD", symbol: "$", retailPrice: 14.99, mrp: 19.99 },
      CA: { currency: "CAD", symbol: "CA$", retailPrice: 19.99, mrp: 25.99 },
    },
  },
  {
    id: "pure-raw-forest-honey",
    name: "Pure Raw Organic Forest Honey 500g",
    slug: "pure-raw-forest-honey",
    sku: "GROC-HONEY-500G",
    category: "Groceries",
    categoryId: "cat-9",
    brand: "BeePure",
    rating: 4.86,
    reviewsCount: 1540,
    price: 449,
    mrp: 599,
    discount: 25,
    badge: "New",
    specs: "100% Raw & Unprocessed | Wild Flora | High Pollen Count",
    bgGradient: "from-[#FFF8E7] via-[#FFF0CF] to-[#FFE6B0]",
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80",
    description: "Ethically harvested wild forest raw honey collected from native deep forest apiaries. Naturally unfiltered, preserving all live enzymes and pollen.",
    stock: 120,
    highlights: [
      { label: "Processing", value: "Unheated & Unfiltered" },
      { label: "Origin", value: "Western Ghats Wild Flora" },
      { label: "Weight", value: "500 g Glass Jar" },
    ],
    features: [
      "Zero added sugars, syrups, or artificial preservatives",
      "Natural energy booster and cough remedy",
      "Full spectrum trace minerals and natural pollen crystals",
    ],
    specifications: {
      Brand: "BeePure",
      "Country of Origin": "India",
      "Net Quantity": "500 g",
    },
    pricing: {
      IN: { currency: "INR", symbol: "₹", retailPrice: 449, mrp: 599 },
      US: { currency: "USD", symbol: "$", retailPrice: 9.99, mrp: 13.99 },
      CA: { currency: "CAD", symbol: "CA$", retailPrice: 13.49, mrp: 17.99 },
    },
  },
  {
    id: "california-raw-almonds",
    name: "California Whole Raw Almonds 500g",
    slug: "california-raw-almonds",
    sku: "GROC-ALMOND-500G",
    category: "Groceries",
    categoryId: "cat-9",
    brand: "NutriNuts",
    rating: 4.79,
    reviewsCount: 1980,
    price: 549,
    mrp: 749,
    discount: 26,
    badge: "Bestseller",
    specs: "High Protein & Vitamin E | Jumbo Size | 100% Natural",
    bgGradient: "from-[#FBF5EB] via-[#F6ECE0] to-[#EFE1D1]",
    image: "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=800&q=80",
    description: "Premium California whole crunchy almonds with dense nutrition, high dietary fiber, healthy fats, and zero cholesterol. Sealed in an airtight ziplock pouch.",
    stock: 220,
    highlights: [
      { label: "Grade", value: "Nonpareil Supreme" },
      { label: "Nutrients", value: "High Vitamin E & Magnesium" },
      { label: "Packaging", value: "Resealable Vacuum Pouch" },
    ],
    features: [
      "Perfect for guilt-free daily snacking, baking, and almond milk",
      "Crisp, sweet, and nutty texture",
      "Hand-sorted to ensure zero broken or damaged kernels",
    ],
    specifications: {
      Brand: "NutriNuts",
      "Country of Origin": "USA",
      "Net Weight": "500 g",
    },
    pricing: {
      IN: { currency: "INR", symbol: "₹", retailPrice: 549, mrp: 749 },
      US: { currency: "USD", symbol: "$", retailPrice: 8.99, mrp: 12.99 },
      CA: { currency: "CAD", symbol: "CA$", retailPrice: 11.99, mrp: 16.99 },
    },
  },
  {
    id: "organic-ceremonial-matcha-tea",
    name: "Organic Ceremonial Grade Matcha Green Tea 100g",
    slug: "organic-ceremonial-matcha-tea",
    sku: "GROC-MATCHA-100G",
    category: "Groceries",
    categoryId: "cat-9",
    brand: "ZenLeaf",
    rating: 4.94,
    reviewsCount: 840,
    price: 799,
    mrp: 1199,
    discount: 33,
    badge: "New",
    specs: "First Harvest Kyoto Leaves | High L-Theanine | 100% Organic",
    bgGradient: "from-[#EDF6ED] via-[#DFEEDF] to-[#CEE4CE]",
    image: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=800&q=80",
    description: "Shade-grown first-flush ceremonial green tea powder stone-ground to ultra-fine perfection. Provides clean, sustained energy with calm mental clarity.",
    stock: 90,
    highlights: [
      { label: "Grade", value: "Ceremonial Uji Grade" },
      { label: "Caffeine", value: "Calm Clean Energy (L-Theanine)" },
      { label: "Packaging", value: "Airtight Tin Can" },
    ],
    features: [
      "Rich vibrant emerald green hue with smooth umami taste",
      "137x more antioxidants than standard brewed green tea",
      "Ideal for traditional matcha bowls, lattes, and smoothies",
    ],
    specifications: {
      Brand: "ZenLeaf",
      "Country of Origin": "Japan",
      "Net Weight": "100 g",
    },
    pricing: {
      IN: { currency: "INR", symbol: "₹", retailPrice: 799, mrp: 1199 },
      US: { currency: "USD", symbol: "$", retailPrice: 18.99, mrp: 26.99 },
      CA: { currency: "CAD", symbol: "CA$", retailPrice: 24.99, mrp: 34.99 },
    },
  },
  {
    id: "organic-raw-chia-seeds",
    name: "Organic Raw Chia Seeds 400g",
    slug: "organic-raw-chia-seeds",
    sku: "GROC-CHIA-400G",
    category: "Groceries",
    categoryId: "cat-9",
    brand: "SuperGrains",
    rating: 4.81,
    reviewsCount: 1620,
    price: 299,
    mrp: 450,
    discount: 33,
    badge: null,
    specs: "Omega-3 Rich | High Dietary Fiber | Gluten-Free Superfood",
    bgGradient: "from-[#F3F4F6] via-[#E5E7EB] to-[#D1D5DB]",
    image: "https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=800&q=80",
    description: "100% certified organic raw black chia seeds loaded with plant-based Omega-3 fatty acids, protein, calcium, and gut-healthy soluble fiber.",
    stock: 190,
    highlights: [
      { label: "Nutrient", value: "Omega-3 & Soluble Fiber" },
      { label: "Purity", value: "100% Raw & Unrefined" },
      { label: "Weight", value: "400 g Pouch" },
    ],
    features: [
      "Absorbs 10x its weight in liquid, perfect for puddings and oat bowls",
      "Promotes sustained satiety and digestive wellness",
      "Free from additives and artificial flavorings",
    ],
    specifications: {
      Brand: "SuperGrains",
      "Country of Origin": "India",
      "Net Weight": "400 g",
    },
    pricing: {
      IN: { currency: "INR", symbol: "₹", retailPrice: 299, mrp: 450 },
      US: { currency: "USD", symbol: "$", retailPrice: 5.49, mrp: 7.99 },
      CA: { currency: "CAD", symbol: "CA$", retailPrice: 6.99, mrp: 9.99 },
    },
  },

  // ─── ELECTRONICS & GADGETS ───
  {
    id: "lenovo-ideapad-slim-5",
    name: "Lenovo IdeaPad Slim 5 15.6\" Laptop",
    slug: "lenovo-ideapad-slim-5",
    sku: "83E8001TIN",
    category: "Electronics",
    categoryId: "cat-1",
    brand: "Lenovo",
    rating: 4.8,
    reviewsCount: 2349,
    price: 42990,
    mrp: 56999,
    discount: 24,
    badge: "Bestseller",
    specs: "Intel Core i5 13th Gen | 16GB RAM | 512GB SSD | Windows 11 Home",
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80",
    ],
    description: "13th Gen Intel Core i5-13420H Processor with 16GB LPDDR5 RAM and 512GB ultra-fast SSD. Crisp 15.6\" Full HD IPS Anti-glare Display.",
    stock: 45,
    highlights: [
      { label: "Processor", value: "Intel Core i5 13th Gen" },
      { label: "RAM", value: "16 GB LPDDR5" },
      { label: "Storage", value: "512 GB SSD" },
      { label: "Display", value: "15.6\" FHD IPS" },
    ],
    features: [
      "13th Gen Intel Core i5-13420H Processor (8 Cores, up to 4.6 GHz)",
      "16GB LPDDR5 RAM for smooth multitasking",
      "Backlit Keyboard, Fingerprint Reader, and HD Webcam",
    ],
    specifications: {
      Brand: "Lenovo",
      Series: "IdeaPad Slim 5",
      Warranty: "1 Year Onsite Warranty",
    },
    pricing: {
      IN: { currency: "INR", symbol: "₹", retailPrice: 42990, mrp: 56999 },
      US: { currency: "USD", symbol: "$", retailPrice: 549, mrp: 720 },
      CA: { currency: "CAD", symbol: "CA$", retailPrice: 729, mrp: 950 },
    },
  },
  {
    id: "asus-tuf-gaming-f15",
    name: "ASUS TUF Gaming F15",
    slug: "asus-tuf-gaming-f15",
    sku: "FX506HF-HN024W",
    category: "Electronics",
    categoryId: "cat-1",
    brand: "ASUS",
    rating: 4.6,
    reviewsCount: 1982,
    price: 59990,
    mrp: 74999,
    discount: 20,
    badge: "New",
    specs: "Intel Core i5 13th Gen | 16GB | 512GB SSD | RTX 3050 | 15.6\"",
    image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80",
    description: "Built for serious gaming and high durability. Equipped with NVIDIA GeForce RTX 3050 graphics and 144Hz IPS display.",
    stock: 28,
    highlights: [
      { label: "Processor", value: "Intel Core i5 13th Gen" },
      { label: "RAM", value: "16 GB DDR4" },
      { label: "Graphics", value: "NVIDIA RTX 3050 4GB" },
    ],
    features: [
      "NVIDIA GeForce RTX 3050 4GB Graphics",
      "144Hz Adaptive-Sync Gaming Display",
    ],
    specifications: {
      Brand: "ASUS",
      Series: "TUF Gaming F15",
    },
    pricing: {
      IN: { currency: "INR", symbol: "₹", retailPrice: 59990, mrp: 74999 },
      US: { currency: "USD", symbol: "$", retailPrice: 749, mrp: 940 },
      CA: { currency: "CAD", symbol: "CA$", retailPrice: 999, mrp: 1250 },
    },
  },
  {
    id: "philips-air-fryer-4-1l",
    name: "Philips Air Fryer 4.1L (Rapid Air Tech)",
    slug: "philips-air-fryer-4-1l",
    sku: "HD9200/90",
    category: "Kitchen & Dining",
    categoryId: "cat-3",
    brand: "Philips",
    rating: 4.8,
    reviewsCount: 2340,
    price: 3499,
    mrp: 5299,
    discount: 42,
    badge: "Bestseller",
    specs: "Rapid Air Technology | 1400W | Dishwasher Safe",
    image: "https://images.unsplash.com/photo-1556909172-8c2f041fca1e?auto=format&fit=crop&w=800&q=80",
    description: "Healthy frying with Rapid Air Technology. Fry with up to 90% less fat with recipe app integration.",
    stock: 120,
    highlights: [
      { label: "Capacity", value: "4.1 Litres" },
      { label: "Power", value: "1400 Watts" },
    ],
    features: [
      "Rapid Air Technology swirls hot air for crispy texture",
      "Removable dishwasher safe parts",
    ],
    specifications: {
      Brand: "Philips",
      Warranty: "2 Years Warranty",
    },
    pricing: {
      IN: { currency: "INR", symbol: "₹", retailPrice: 3499, mrp: 5299 },
      US: { currency: "USD", symbol: "$", retailPrice: 49.99, mrp: 79.99 },
      CA: { currency: "CAD", symbol: "CA$", retailPrice: 65.99, mrp: 99.99 },
    },
  },
  {
    id: "prestige-mixer-grinder-750w",
    name: "Prestige Mixer Grinder 750W (3 Jars)",
    slug: "prestige-mixer-grinder-750w",
    sku: "IRIS-750W",
    category: "Kitchen & Dining",
    categoryId: "cat-3",
    brand: "Prestige",
    rating: 4.7,
    reviewsCount: 9764,
    price: 2299,
    mrp: 3429,
    discount: 34,
    badge: "Bestseller",
    specs: "750W Copper Motor | 3 Stainless Steel Jars | Overload Protection",
    image: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=800&q=80",
    description: "Heavy-duty 750W pure copper motor with 3 stainless steel jars for superfine spice grinding.",
    stock: 95,
    highlights: [
      { label: "Motor", value: "750W Pure Copper" },
      { label: "Jars", value: "3 Stainless Steel" },
    ],
    features: [
      "Pure copper winding motor for durability",
      "Overload protection switch",
    ],
    specifications: {
      Brand: "Prestige",
      Warranty: "2 Years Warranty",
    },
    pricing: {
      IN: { currency: "INR", symbol: "₹", retailPrice: 2299, mrp: 3429 },
      US: { currency: "USD", symbol: "$", retailPrice: 34.99, mrp: 49.99 },
      CA: { currency: "CAD", symbol: "CA$", retailPrice: 44.99, mrp: 64.99 },
    },
  },
  {
    id: "noise-buds-vs104",
    name: "Noise Buds VS104 True Wireless Earbuds",
    slug: "noise-buds-vs104",
    sku: "AUD-NOISE-VS104",
    category: "Electronics",
    categoryId: "cat-1",
    brand: "Noise",
    rating: 4.4,
    reviewsCount: 8493,
    price: 1499,
    mrp: 2999,
    discount: 50,
    badge: null,
    specs: "45 Hours Playtime | Quad Mic ENC | 13mm Driver | Instacharge",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80",
    description: "45 hours total playtime with low-latency gaming mode and quad mic environmental noise cancellation.",
    stock: 150,
    highlights: [
      { label: "Playtime", value: "Up to 45 Hours" },
      { label: "Driver", value: "13mm Dynamic" },
    ],
    features: [
      "Instacharge gives 200 minutes in 10 minutes",
      "IPX5 sweat resistance",
    ],
    specifications: {
      Brand: "Noise",
      Warranty: "1 Year Warranty",
    },
    pricing: {
      IN: { currency: "INR", symbol: "₹", retailPrice: 1499, mrp: 2999 },
      US: { currency: "USD", symbol: "$", retailPrice: 19.99, mrp: 39.99 },
      CA: { currency: "CAD", symbol: "CA$", retailPrice: 26.99, mrp: 49.99 },
    },
  },
  {
    id: "live-indoor-plant",
    name: "Live Indoor Areca Palm & Air Purifying Plant",
    slug: "live-indoor-plant",
    sku: "PLNT-ARECA-01",
    category: "Home & Living",
    categoryId: "cat-2",
    brand: "GreenFlora",
    rating: 4.9,
    reviewsCount: 2873,
    price: 499,
    mrp: 799,
    discount: 38,
    badge: null,
    specs: "NASA Certified Air Purifier | Self-Watering Pot Included",
    image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80",
    description: "Lush green live indoor air purifying plant in a designer self-watering ceramic pot.",
    stock: 200,
    highlights: [
      { label: "Type", value: "Live Potted Plant" },
      { label: "Pot", value: "Self-watering Ceramic" },
    ],
    features: [
      "Natural humidifier and pollutant remover",
      "Low maintenance indoor green companion",
    ],
    specifications: {
      Brand: "GreenFlora",
    },
    pricing: {
      IN: { currency: "INR", symbol: "₹", retailPrice: 499, mrp: 799 },
      US: { currency: "USD", symbol: "$", retailPrice: 9.99, mrp: 14.99 },
      CA: { currency: "CAD", symbol: "CA$", retailPrice: 12.99, mrp: 18.99 },
    },
  },
];

// In-memory live store with LocalStorage persistence for realistic Admin CRUD
const STORAGE_KEYS = {
  PRODUCTS: "vanom_mock_products_v5",
  CATEGORIES: "vanom_mock_categories_v5",
};

export { INITIAL_PRODUCTS, INITIAL_CATEGORIES };

export const getLiveProducts = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const initialMap = new Map(INITIAL_PRODUCTS.map((p) => [p.id, p]));
        const merged = INITIAL_PRODUCTS.map((initP) => {
          const existing = parsed.find((p) => p.id === initP.id || p.slug === initP.slug);
          return existing ? { ...initP, ...existing } : initP;
        });
        parsed.forEach((p) => {
          if (!initialMap.has(p.id) && !merged.some((m) => m.id === p.id || m.slug === p.slug)) {
            merged.push(p);
          }
        });
        return merged;
      }
    }
  } catch (e) {}
  return [...INITIAL_PRODUCTS];
};

export const saveLiveProducts = (products) => {
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  } catch (e) {}
};

export const getLiveCategories = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const initialMap = new Map(INITIAL_CATEGORIES.map((c) => [c.id, c]));
        const merged = INITIAL_CATEGORIES.map((initC) => {
          const existing = parsed.find((c) => c.id === initC.id || c.slug === initC.slug);
          return existing ? { ...initC, ...existing } : initC;
        });
        parsed.forEach((c) => {
          if (!initialMap.has(c.id) && !merged.some((m) => m.id === c.id || m.slug === c.slug)) {
            merged.push(c);
          }
        });
        return merged;
      }
    }
  } catch (e) {}
  return [...INITIAL_CATEGORIES];
};

export const saveLiveCategories = (categories) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  } catch (e) {}
};

export const MOCK_CATEGORIES = getLiveCategories();
export const MOCK_PRODUCTS = getLiveProducts();

export const MOCK_COMPANIES = [
  {
    id: "comp-1",
    legalName: "Apex Global Wholesale Traders Pvt Ltd",
    tradingName: "Apex Global Wholesale",
    registrationNumber: "U01100MH2020PTC345678",
    taxId: "27AAACA1234A1Z1",
    country: "India",
    countryCode: "IN",
    status: "APPROVED",
    creditLimit: 1000000,
    availableCredit: 785000,
    paymentTerms: "NET_30",
    primaryContact: "Rajesh Kulkarni",
    email: "buyer@apexwholesale.in",
    phone: "+91 98200 12345",
    addresses: [
      { id: "addr-1", type: "SHIPPING", line1: "Warehouse 4, Global Logistics Park", city: "Navi Mumbai", state: "Maharashtra", postalCode: "400705", country: "India", isDefault: true },
      { id: "addr-2", type: "BILLING", line1: "Suite 302, Financial Hub", city: "Mumbai", state: "Maharashtra", postalCode: "400051", country: "India", isDefault: true },
    ],
    members: [
      { id: "mem-1", name: "Rajesh Kulkarni", email: "buyer@apexwholesale.in", role: "COMPANY_ADMIN", isPrimary: true },
      { id: "mem-2", name: "Sunil Verma", email: "procurement@apexwholesale.in", role: "COMPANY_BUYER", isPrimary: false },
    ],
    documents: [
      { id: "doc-1", name: "GST_Certificate_2026.pdf", type: "TAX_CERTIFICATE", status: "VERIFIED", uploadedAt: "2026-01-15T10:00:00Z" },
      { id: "doc-2", name: "Certificate_of_Incorporation.pdf", type: "BUSINESS_REGISTRATION", status: "VERIFIED", uploadedAt: "2026-01-15T10:05:00Z" },
    ],
  },
  {
    id: "comp-2",
    legalName: "Prime Logistics & Supplies LLC",
    tradingName: "Prime Supplies",
    registrationNumber: "US-DE-987654",
    taxId: "EIN-82-9384721",
    country: "United States",
    countryCode: "US",
    status: "UNDER_REVIEW",
    creditLimit: 50000,
    availableCredit: 50000,
    paymentTerms: "NET_15",
    primaryContact: "David Miller",
    email: "david@primesupplies.com",
    phone: "+1 214 555 0192",
    addresses: [
      { id: "addr-3", type: "SHIPPING", line1: "742 Commercial Way", city: "Dallas", state: "Texas", postalCode: "75201", country: "United States", isDefault: true },
    ],
    members: [
      { id: "mem-3", name: "David Miller", email: "david@primesupplies.com", role: "COMPANY_ADMIN", isPrimary: true },
    ],
    documents: [
      { id: "doc-3", name: "IRS_W9_Form.pdf", type: "TAX_CERTIFICATE", status: "UNDER_REVIEW", uploadedAt: "2026-02-10T14:30:00Z" },
      { id: "doc-4", name: "Delaware_LLC_Registration.pdf", type: "BUSINESS_REGISTRATION", status: "UNDER_REVIEW", uploadedAt: "2026-02-10T14:32:00Z" },
    ],
  },
];

export const MOCK_ORDERS = [
  {
    id: "ord-101",
    orderNumber: "ORD-20260228-8921",
    type: "B2C",
    createdAt: "2026-02-27T14:20:00Z",
    status: "DELIVERED",
    currency: "USD",
    symbol: "$",
    subtotal: 42.00,
    taxAmount: 449.82,
    shippingCost: 80,
    totalAmount: 49.99,
    itemsCount: 1,
    shippingAddress: {
      name: "Ramesh Sharma",
      line1: "Flat 402, Lotus Heights",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560001",
      country: "India",
    },
    items: [
      { id: "oi-1", name: "Royal Heritage Aged Basmati Rice (25 KG Sack)", sku: "FMCG-RICE-25KG", quantity: 1, unitPrice: 42.00, subtotal: 42.00, image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80" },
    ],
    timeline: [
      { status: "PLACED", label: "Order Placed", date: "2026-02-27 14:20" },
      { status: "CONFIRMED", label: "Payment Confirmed", date: "2026-02-27 14:21" },
      { status: "PACKED", label: "Packed at Fulfillment Center", date: "2026-02-27 18:00" },
      { status: "SHIPPED", label: "Dispatched with Express Logistics", date: "2026-02-28 09:30" },
      { status: "DELIVERED", label: "Delivered Successfully", date: "2026-02-28 13:45" },
    ],
  },
];

export const MOCK_QUOTES = [
  {
    id: "qte-201",
    quoteNumber: "QTE-20260228-1094",
    companyName: "Apex Global Wholesale Traders Pvt Ltd",
    status: "QUOTED",
    version: 2,
    createdAt: "2026-02-25T09:00:00Z",
    validUntil: "2026-03-15T23:59:59Z",
    currency: "USD",
    symbol: "$",
    subtotal: 3200,
    discountAmount: 9500,
    taxAmount: 32490,
    shippingCost: 5500,
    totalAmount: 3500,
    notes: "Consignment of 200 Bundles Corrugated Boxes & 100 Stretch Wrap Cartons.",
    items: [
      { id: "qi-1", name: "Heavy-Duty Corrugated Shipping Boxes (50 PK)", sku: "PKG-BOX-50PK", quantity: 200, unitPrice: 950, subtotal: 3200, requestedDeliveryDate: "2026-03-10" },
    ],
  },
];

export const MOCK_ADMIN_METRICS = {
  revenueToday: "$12,85,400",
  revenueGrowth: "+24.8%",
  activeOrdersCount: 68,
  b2bOrdersCount: 22,
  pendingCompanyVerifications: 4,
  pendingQuotesCount: 6,
  lowStockAlertsCount: 1,
  totalCustomers: 45200,
  totalB2BCompanies: 340,
};
