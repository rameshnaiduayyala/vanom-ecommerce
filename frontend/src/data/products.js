export const products = [
  {
    id: "soil-50kg",
    name: "Premium Garden Soil",
    category: "Soil",
    image: "🌱",
    description: "Premium growing medium for landscaping, nurseries and home gardens.",
    retail: { IN: 499, US: 19.99, GB: 17.99 },
    wholesale: {
      IN: [[20, 49, 420], [50, 99, 390], [100, null, 350]],
      US: [[20, 49, 16.5], [50, 99, 14.9], [100, null, 13.5]],
      GB: [[20, 49, 14.9], [50, 99, 13.4], [100, null, 12.2]]
    },
    moq: 20,
    unit: "Sack",
    pallet: 40
  },
  {
    id: "ceramic-pot",
    name: "Premium Ceramic Pot",
    category: "Pots",
    image: "🪴",
    description: "Durable decorative pot suitable for retail and commercial landscaping.",
    retail: { IN: 299, US: 8.99, GB: 7.99 },
    wholesale: {
      IN: [[24, 99, 245], [100, null, 210]],
      US: [[24, 99, 7.2], [100, null, 6.4]],
      GB: [[24, 99, 6.5], [100, null, 5.8]]
    },
    moq: 24,
    unit: "Piece",
    pallet: 48
  },
  {
    id: "indoor-plant",
    name: "Indoor Foliage Plant",
    category: "Plants",
    image: "🌿",
    description: "Healthy indoor foliage plants for homes, offices and commercial projects.",
    retail: { IN: 799, US: 24.99, GB: 21.99 },
    wholesale: {
      IN: [[25, 99, 650], [100, null, 570]],
      US: [[25, 99, 20], [100, null, 17.5]],
      GB: [[25, 99, 17.8], [100, null, 15.9]]
    },
    moq: 25,
    unit: "Piece",
    pallet: 50
  }
];
