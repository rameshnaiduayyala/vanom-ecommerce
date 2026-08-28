const INITIAL_CATEGORIES = [
  { id: "cat-1", name: "Electronics & Tech", slug: "electronics-and-tech", count: 142, description: "Smartphones, tablets, enterprise POS, cabling and commercial electronics." },
  { id: "cat-2", name: "Groceries & FMCG Bulk", slug: "groceries-and-fmcg", count: 320, description: "Grains, basmati rice 25KG sacks, bulk cooking oils, pantry staples." },
  { id: "cat-3", name: "Industrial & Packaging", slug: "industrial-and-packaging", count: 85, description: "Corrugated shipping master boxes, stretch wrap films, strapping and pallet goods." },
  { id: "cat-4", name: "Home & Commercial Kitchen", slug: "home-and-kitchen", count: 96, description: "High-capacity induction burners, commercial cookware, restaurant appliances." },
  { id: "cat-5", name: "Commercial Safety & Security", slug: "safety-and-security", count: 180, description: "Surveillance camera systems, biometric access controllers, industrial alarms, and security hardware." },
  { id: "cat-6", name: "Building & Hardware", slug: "building-and-hardware", count: 64, description: "Fasteners, safety equipment, tools, and industrial materials." },
];

const INITIAL_PRODUCTS = [
  {
    id: "prod-1",
    name: "Royal Heritage Aged Basmati Rice (25 KG Sack)",
    slug: "royal-basmati-rice-25kg",
    sku: "FMCG-RICE-25KG",
    category: "Groceries & FMCG Bulk",
    categoryId: "cat-2",
    brand: "Vanom Pantry",
    rating: 4.9,
    reviewsCount: 384,
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80",
    description: "Extra-long grain premium aged basmati rice with aromatic fragrance. Packaged in moisture-proof woven poly sacks for retail and wholesale food services.",
    stock: 5200,
    packaging: {
      unitName: "Sack (25 KG)",
      weightKg: 25,
      dimensionsCm: "65 x 40 x 18",
      palletQuantity: 40,
      palletWeightKg: 1000,
    },
    pricing: {
      IN: {
        currency: "USD",
        symbol: "$",
        retailPrice: 42.00,
        wholesaleTiers: [
          { minQuantity: 20, maxQuantity: 49, unitPrice: 2150 },
          { minQuantity: 50, maxQuantity: 99, unitPrice: 1950 },
          { minQuantity: 100, maxQuantity: null, unitPrice: 1750 },
        ],
        moq: 20,
      },
      US: {
        currency: "USD",
        symbol: "$",
        retailPrice: 42.00,
        wholesaleTiers: [
          { minQuantity: 20, maxQuantity: 49, unitPrice: 35.00 },
          { minQuantity: 50, maxQuantity: 99, unitPrice: 31.50 },
          { minQuantity: 100, maxQuantity: null, unitPrice: 28.00 },
        ],
        moq: 20,
      },
      GB: {
        currency: "GBP",
        symbol: "£",
        retailPrice: 34.00,
        wholesaleTiers: [
          { minQuantity: 20, maxQuantity: 49, unitPrice: 28.50 },
          { minQuantity: 50, maxQuantity: 99, unitPrice: 25.50 },
          { minQuantity: 100, maxQuantity: null, unitPrice: 22.50 },
        ],
        moq: 20,
      },
    },
  },
  {
    id: "prod-2",
    name: "Heavy-Duty Corrugated Shipping Boxes (Master Bundle of 50)",
    slug: "corrugated-shipping-boxes-50",
    sku: "PKG-BOX-50PK",
    category: "Industrial & Packaging",
    categoryId: "cat-3",
    brand: "PackPro",
    rating: 4.8,
    reviewsCount: 192,
    image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=800&q=80",
    description: "3-ply high burst test corrugated cardboard boxes for logistics, ecommerce fulfillment, and warehouse storage.",
    stock: 3400,
    packaging: {
      unitName: "Bundle (50 pcs)",
      weightKg: 15,
      dimensionsCm: "60 x 50 x 30",
      palletQuantity: 30,
      palletWeightKg: 450,
    },
    pricing: {
      IN: {
        currency: "USD",
        symbol: "$",
        retailPrice: 1499,
        wholesaleTiers: [
          { minQuantity: 10, maxQuantity: 29, unitPrice: 1250 },
          { minQuantity: 30, maxQuantity: 79, unitPrice: 1100 },
          { minQuantity: 80, maxQuantity: null, unitPrice: 950 },
        ],
        moq: 10,
      },
      US: {
        currency: "USD",
        symbol: "$",
        retailPrice: 29.99,
        wholesaleTiers: [
          { minQuantity: 10, maxQuantity: 29, unitPrice: 24.50 },
          { minQuantity: 30, maxQuantity: 79, unitPrice: 21.00 },
          { minQuantity: 80, maxQuantity: null, unitPrice: 18.50 },
        ],
        moq: 10,
      },
      GB: {
        currency: "GBP",
        symbol: "£",
        retailPrice: 24.99,
        wholesaleTiers: [
          { minQuantity: 10, maxQuantity: 29, unitPrice: 20.00 },
          { minQuantity: 30, maxQuantity: 79, unitPrice: 17.50 },
          { minQuantity: 80, maxQuantity: null, unitPrice: 15.00 },
        ],
        moq: 10,
      },
    },
  },
  {
    id: "prod-3",
    name: "Ultra HD Smart Android Tablet 10.1-inch (Commercial Pack)",
    slug: "smart-android-tablet-commercial",
    sku: "TECH-TAB-101",
    category: "Electronics & Tech",
    categoryId: "cat-1",
    brand: "NexCore Tech",
    rating: 4.7,
    reviewsCount: 145,
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80",
    description: "Octa-core 128GB LTE enterprise tablet designed for POS, retail counters, inventory management, and digital operations.",
    stock: 920,
    packaging: {
      unitName: "Piece",
      weightKg: 0.8,
      dimensionsCm: "25 x 18 x 4",
      palletQuantity: 120,
      palletWeightKg: 100,
    },
    pricing: {
      IN: {
        currency: "USD",
        symbol: "$",
        retailPrice: 12999,
        wholesaleTiers: [
          { minQuantity: 10, maxQuantity: 29, unitPrice: 10800 },
          { minQuantity: 30, maxQuantity: 79, unitPrice: 9900 },
          { minQuantity: 80, maxQuantity: null, unitPrice: 9100 },
        ],
        moq: 5,
      },
      US: {
        currency: "USD",
        symbol: "$",
        retailPrice: 189.99,
        wholesaleTiers: [
          { minQuantity: 10, maxQuantity: 29, unitPrice: 155.00 },
          { minQuantity: 30, maxQuantity: 79, unitPrice: 142.00 },
          { minQuantity: 80, maxQuantity: null, unitPrice: 130.00 },
        ],
        moq: 5,
      },
      GB: {
        currency: "GBP",
        symbol: "£",
        retailPrice: 159.00,
        wholesaleTiers: [
          { minQuantity: 10, maxQuantity: 29, unitPrice: 129.00 },
          { minQuantity: 30, maxQuantity: 79, unitPrice: 118.00 },
          { minQuantity: 80, maxQuantity: null, unitPrice: 108.00 },
        ],
        moq: 5,
      },
    },
  },
  {
    id: "prod-4",
    name: "Commercial Stainless Steel Induction Cooktop 3500W",
    slug: "commercial-induction-cooktop-3500w",
    sku: "KTCH-IND-3500W",
    category: "Home & Commercial Kitchen",
    categoryId: "cat-4",
    brand: "ChefMaster",
    rating: 4.8,
    reviewsCount: 78,
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80",
    description: "Heavy-duty commercial countertop induction burner for restaurants, catering services, and high-speed cloud kitchens.",
    stock: 450,
    packaging: {
      unitName: "Unit",
      weightKg: 6.5,
      dimensionsCm: "45 x 38 x 15",
      palletQuantity: 40,
      palletWeightKg: 260,
    },
    pricing: {
      IN: {
        currency: "USD",
        symbol: "$",
        retailPrice: 6499,
        wholesaleTiers: [
          { minQuantity: 5, maxQuantity: 14, unitPrice: 5400 },
          { minQuantity: 15, maxQuantity: 39, unitPrice: 4850 },
          { minQuantity: 40, maxQuantity: null, unitPrice: 4300 },
        ],
        moq: 5,
      },
      US: {
        currency: "USD",
        symbol: "$",
        retailPrice: 129.00,
        wholesaleTiers: [
          { minQuantity: 5, maxQuantity: 14, unitPrice: 108.00 },
          { minQuantity: 15, maxQuantity: 39, unitPrice: 97.00 },
          { minQuantity: 40, maxQuantity: null, unitPrice: 86.00 },
        ],
        moq: 5,
      },
      GB: {
        currency: "GBP",
        symbol: "£",
        retailPrice: 99.00,
        wholesaleTiers: [
          { minQuantity: 5, maxQuantity: 14, unitPrice: 84.00 },
          { minQuantity: 15, maxQuantity: 39, unitPrice: 75.00 },
          { minQuantity: 40, maxQuantity: null, unitPrice: 66.00 },
        ],
        moq: 5,
      },
    },
  },
  {
    id: "prod-5",
    name: "Industrial Pallet Stretch Wrap Film (Carton of 4 Rolls)",
    slug: "pallet-stretch-film-4rolls",
    sku: "PKG-WRAP-4RL",
    category: "Industrial & Packaging",
    categoryId: "cat-3",
    brand: "PackPro",
    rating: 4.9,
    reviewsCount: 110,
    image: "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=800&q=80",
    description: "High-cling 23-micron stretch film rolls for pallet wrapping, moisture protection, and secure logistics freight.",
    stock: 2800,
    packaging: {
      unitName: "Carton (4 Rolls)",
      weightKg: 12,
      dimensionsCm: "50 x 30 x 30",
      palletQuantity: 48,
      palletWeightKg: 576,
    },
    pricing: {
      IN: {
        currency: "USD",
        symbol: "$",
        retailPrice: 1899,
        wholesaleTiers: [
          { minQuantity: 10, maxQuantity: 29, unitPrice: 1550 },
          { minQuantity: 30, maxQuantity: 79, unitPrice: 1390 },
          { minQuantity: 80, maxQuantity: null, unitPrice: 1220 },
        ],
        moq: 10,
      },
      US: {
        currency: "USD",
        symbol: "$",
        retailPrice: 38.00,
        wholesaleTiers: [
          { minQuantity: 10, maxQuantity: 29, unitPrice: 31.00 },
          { minQuantity: 30, maxQuantity: 79, unitPrice: 27.50 },
          { minQuantity: 80, maxQuantity: null, unitPrice: 24.00 },
        ],
        moq: 10,
      },
      GB: {
        currency: "GBP",
        symbol: "£",
        retailPrice: 32.00,
        wholesaleTiers: [
          { minQuantity: 10, maxQuantity: 29, unitPrice: 26.00 },
          { minQuantity: 30, maxQuantity: 79, unitPrice: 23.00 },
          { minQuantity: 80, maxQuantity: null, unitPrice: 20.00 },
        ],
        moq: 10,
      },
    },
  },
  {
    id: "prod-6",
    name: "4K Ultra-HD 8-Channel Commercial PoE Surveillance System",
    slug: "commercial-poe-surveillance-system-4k",
    sku: "SEC-CAM-4K-8CH",
    category: "Commercial Safety & Security",
    categoryId: "cat-5",
    brand: "Vanom Security Systems",
    rating: 4.9,
    reviewsCount: 112,
    image: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80",
    description: "IP67 weatherproof night-vision commercial dome cameras with 2TB NVR storage and encrypted cloud remote streaming.",
    stock: 850,
    packaging: {
      unitName: "System Box (8 Cams + NVR)",
      weightKg: 12,
      dimensionsCm: "50 x 40 x 30",
      palletQuantity: 30,
      palletWeightKg: 360,
    },
    pricing: {
      IN: {
        currency: "USD",
        symbol: "$",
        retailPrice: 5999,
        wholesaleTiers: [
          { minQuantity: 5, maxQuantity: 14, unitPrice: 4800 },
          { minQuantity: 15, maxQuantity: 39, unitPrice: 4200 },
          { minQuantity: 40, maxQuantity: null, unitPrice: 3700 },
        ],
        moq: 5,
      },
      US: {
        currency: "USD",
        symbol: "$",
        retailPrice: 119.00,
        wholesaleTiers: [
          { minQuantity: 5, maxQuantity: 14, unitPrice: 96.00 },
          { minQuantity: 15, maxQuantity: 39, unitPrice: 84.00 },
          { minQuantity: 40, maxQuantity: null, unitPrice: 74.00 },
        ],
        moq: 5,
      },
      GB: {
        currency: "GBP",
        symbol: "£",
        retailPrice: 95.00,
        wholesaleTiers: [
          { minQuantity: 5, maxQuantity: 14, unitPrice: 76.00 },
          { minQuantity: 15, maxQuantity: 39, unitPrice: 67.00 },
          { minQuantity: 40, maxQuantity: null, unitPrice: 59.00 },
        ],
        moq: 5,
      },
    },
  },
];

// In-memory live store with LocalStorage persistence for realistic Admin CRUD
const STORAGE_KEYS = {
  PRODUCTS: "vanom_mock_products_v2",
  CATEGORIES: "vanom_mock_categories_v2",
};

export const getLiveProducts = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (saved) return JSON.parse(saved);
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
    if (saved) return JSON.parse(saved);
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
  {
    id: "ord-102",
    orderNumber: "ORD-20260228-9410",
    poNumber: "PO-APEX-2026-04",
    type: "B2B",
    companyName: "Apex Global Wholesale Traders Pvt Ltd",
    createdAt: "2026-02-28T10:15:00Z",
    status: "PROCESSING",
    currency: "USD",
    symbol: "$",
    subtotal: 2800,
    taxAmount: 31500,
    shippingCost: 4500,
    totalAmount: 211000,
    paymentTerms: "NET_30",
    itemsCount: 100,
    shippingAddress: {
      name: "Apex Logistics Hub",
      line1: "Warehouse 4, Global Logistics Park",
      city: "Navi Mumbai",
      state: "Maharashtra",
      postalCode: "400705",
      country: "India",
    },
    items: [
      { id: "oi-2", name: "Royal Heritage Aged Basmati Rice (25 KG Sack)", sku: "FMCG-RICE-25KG", quantity: 100, unitPrice: 1750, subtotal: 2800, packaging: "2.5 Pallets (40 Sacks / Pallet)", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80" },
    ],
    timeline: [
      { status: "PLACED", label: "Purchase Order Received", date: "2026-02-28 10:15" },
      { status: "CONFIRMED", label: "Commercial Credit Verified (NET 30)", date: "2026-02-28 10:16" },
      { status: "PROCESSING", label: "Allocated to Mumbai Central Warehouse", date: "2026-02-28 11:00" },
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
