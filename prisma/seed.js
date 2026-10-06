import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ── Helpers ──────────────────────────────────────────────────────
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ── Categories we'll create ───────────────────────────────────────
const CATEGORIES = [
  { name: "Sneakers", slug: "sneakers" },
  { name: "Hoodies", slug: "hoodies" },
  { name: "Tees", slug: "tees" },
  { name: "Accessories", slug: "accessories" },
];

// ── Main seed function ────────────────────────────────────────────
async function main() {
  console.log("🌱 Seeding database...");

  // 1. Clean existing data (order matters due to foreign keys)
  await prisma.wishlistItem.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  console.log("✓ Cleared existing data");

  // 2. Create categories
  const categories = await Promise.all(
    CATEGORIES.map((cat) => prisma.category.create({ data: cat })),
  );
  console.log(`✓ Created ${categories.length} categories`);

  // 3. Fetch products from DummyJSON
  const res = await fetch("https://dummyjson.com/products?limit=40&skip=0");
  const data = await res.json();
  const rawProducts = data.products;
  console.log(`✓ Fetched ${rawProducts.length} products from DummyJSON`);

  // 4. Map DummyJSON products to our schema and insert
  const createdProducts = [];

  for (const p of rawProducts) {
    // Assign category based on DummyJSON's category field
    const categoryMap = {
      "mens-shirts": "tees",
      "womens-dresses": "tees",
      "mens-shoes": "sneakers",
      "womens-shoes": "sneakers",
      "mens-watches": "accessories",
      "womens-watches": "accessories",
      "womens-bags": "accessories",
      "womens-jewellery": "accessories",
      sunglasses: "accessories",
      tops: "tees",
    };

    const targetSlug = categoryMap[p.category] ?? "accessories";
    const category = categories.find((c) => c.slug === targetSlug);

    // Make slug unique by appending the DummyJSON id
    const slug = `${slugify(p.title)}-${p.id}`;

    const product = await prisma.product.create({
      data: {
        name: p.title,
        slug,
        description: p.description,
        price: p.price,
        stock: p.stock ?? Math.floor(Math.random() * 50) + 5,
        images: p.images ?? [p.thumbnail],
        isFeatured: p.rating > 4.5, // high-rated products become featured drops
        categoryId: category.id,
      },
    });

    createdProducts.push(product);
  }

  console.log(`✓ Created ${createdProducts.length} products`);

  // 5. Create an admin user for testing the admin panel
  const admin = await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@dropzone.com",
      passwordHash: "placeholder", // replaced with real hash in Module 3
      role: "ADMIN",
    },
  });
  console.log(`✓ Created admin user: ${admin.email}`);

  // 6. Create a test customer
  const customer = await prisma.user.create({
    data: {
      name: "Test Customer",
      email: "customer@dropzone.com",
      passwordHash: "placeholder",
      role: "CUSTOMER",
    },
  });
  console.log(`✓ Created test customer: ${customer.email}`);

  console.log("\n✅ Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
