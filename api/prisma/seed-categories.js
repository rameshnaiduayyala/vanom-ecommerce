import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const categoriesData = [
  {
    name: "Electronics & Gadgets",
    slug: "electronics-gadgets",
    imageUrl: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=600&q=80",
    subcategories: [
      { name: "Mobiles & Accessories", slug: "mobiles-accessories", imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80" },
      { name: "Laptops & Computers", slug: "laptops-computers", imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80" },
      { name: "TVs & Home Entertainment", slug: "tvs-home-entertainment", imageUrl: "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=600&q=80" },
      { name: "Cameras & Drones", slug: "cameras-drones", imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80" },
    ]
  },
  {
    name: "Health, Fitness & Wearables",
    slug: "health-fitness-wearables",
    imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80",
    subcategories: [
      { name: "Health Monitoring", slug: "health-monitoring", imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80" },
      { name: "Fitness Equipment", slug: "fitness-equipment", imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80" },
      { name: "Nutrition & Supplements", slug: "nutrition-supplements", imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80" },
    ]
  },
  {
    name: "Home & Kitchen",
    slug: "home-kitchen",
    imageUrl: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80",
    subcategories: [
      { name: "Kitchen Appliances", slug: "kitchen-appliances", imageUrl: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=600&q=80" },
      { name: "Cookware & Tableware", slug: "cookware-tableware", imageUrl: "https://images.unsplash.com/photo-1584269600519-112d071b35e6?auto=format&fit=crop&w=600&q=80" },
      { name: "Home Decor & Furnishing", slug: "home-decor-furnishing", imageUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80" },
    ]
  },
  {
    name: "Groceries & Daily Needs",
    slug: "groceries-daily-needs",
    imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
    subcategories: [
      { name: "Staples & Pantry", slug: "staples-pantry", imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80" },
      { name: "Spices & Masalas", slug: "spices-masalas", imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80" },
      { name: "Snacks & Packaged Foods", slug: "snacks-packaged-foods", imageUrl: "https://images.unsplash.com/photo-1621996346565-e3d5d6281699?auto=format&fit=crop&w=600&q=80" },
      { name: "Beverages", slug: "beverages", imageUrl: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=600&q=80" },
    ]
  },
  {
    name: "Beauty & Personal Care",
    slug: "beauty-personal-care",
    imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80",
    subcategories: [
      { name: "Skin & Hair Care", slug: "skin-hair-care", imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80" },
      { name: "Makeup & Cosmetics", slug: "makeup-cosmetics", imageUrl: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80" },
      { name: "Grooming Appliances", slug: "grooming-appliances", imageUrl: "https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=600&q=80" },
    ]
  },
  {
    name: "Household & Cleaning",
    slug: "household-cleaning",
    imageUrl: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=600&q=80",
    subcategories: [
      { name: "Floor & Surface Cleaners", slug: "floor-surface-cleaners", imageUrl: "https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=600&q=80" },
      { name: "Dishwashing & Laundry", slug: "dishwashing-laundry", imageUrl: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=600&q=80" },
      { name: "Pest Control & Repellents", slug: "pest-control-repellents", imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80" },
    ]
  }
];

export async function seedCategories() {
  console.log("🌱 Seeding Parent and Sub Categories...");

  for (const group of categoriesData) {
    const parent = await prisma.category.upsert({
      where: { slug: group.slug },
      update: {
        name: group.name,
        imageUrl: group.imageUrl,
        parentId: null,
        isActive: true
      },
      create: {
        name: group.name,
        slug: group.slug,
        imageUrl: group.imageUrl,
        parentId: null,
        isActive: true
      }
    });

    console.log(`📁 Parent: ${parent.name}`);

    for (const sub of group.subcategories) {
      const child = await prisma.category.upsert({
        where: { slug: sub.slug },
        update: {
          name: sub.name,
          imageUrl: sub.imageUrl,
          parentId: parent.id,
          isActive: true
        },
        create: {
          name: sub.name,
          slug: sub.slug,
          imageUrl: sub.imageUrl,
          parentId: parent.id,
          isActive: true
        }
      });
      console.log(`  └── 📂 Sub: ${child.name}`);
    }
  }

  console.log("✅ Successfully seeded 6 parent categories and 20 subcategories!");
}

async function run() {
  try {
    await seedCategories();
  } catch (err) {
    console.error("❌ Category seed error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

if (process.argv[1]?.includes("seed-categories")) {
  run();
}
