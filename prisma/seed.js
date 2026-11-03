import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Our store categories, and which DummyJSON categories feed each one
const STORE_CATEGORIES = [
  {
    name: "Sneakers",
    slug: "sneakers",
    source: ["mens-shoes", "womens-shoes"],
  },
  {
    name: "Apparel",
    slug: "apparel",
    source: ["mens-shirts", "tops", "womens-dresses"],
  },
  {
    name: "Watches",
    slug: "watches",
    source: ["mens-watches", "womens-watches"],
  },
  {
    name: "Accessories",
    slug: "accessories",
    source: ["sunglasses", "womens-bags", "womens-jewellery"],
  },
];

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Clear store data. Users are NOT deleted, so your accounts survive.
  //    Order matters because of foreign keys (children before parents).
  await prisma.wishlistItem.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  console.log("✓ Cleared products and categories");

  // 2. Create categories, then fetch products for each
  const allCreated = [];

  for (const cat of STORE_CATEGORIES) {
    const category = await prisma.category.create({
      data: { name: cat.name, slug: cat.slug },
    });

    for (const source of cat.source) {
      const res = await fetch(
        `https://dummyjson.com/products/category/${source}`,
      );
      const { products = [] } = await res.json();
      console.log(`  ${source}: ${products.length} products`);

      for (const p of products) {
        const product = await prisma.product.create({
          data: {
            name: p.title,
            slug: `${slugify(p.title)}-${p.id}`,
            description: p.description,
            price: p.price,
            stock: p.stock ?? 20,
            images: p.images?.length ? p.images : [p.thumbnail],
            categoryId: category.id,
          },
        });
        allCreated.push({ id: product.id, rating: p.rating ?? 0 });
      }
    }
  }
  console.log(`✓ Created ${allCreated.length} products`);

  // 3. Feature the 8 highest-rated products on the homepage
  const featured = [...allCreated]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 8);
  await prisma.product.updateMany({
    where: { id: { in: featured.map((f) => f.id) } },
    data: { isFeatured: true },
  });
  console.log(`✓ Marked ${featured.length} products as featured`);

  // 4. Test users with REAL bcrypt hashes. upsert = create if missing,
  //    update if it already exists, so re-running never crashes.
  const users = [
    {
      name: "Admin",
      email: "admin@dropzone.com",
      password: "Admin@123",
      role: "ADMIN",
    },
    {
      name: "Test Customer",
      email: "customer@dropzone.com",
      password: "Customer@123",
      role: "CUSTOMER",
    },
  ];

  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.password, 12);
    await prisma.user.upsert({
      where: { email: u.email },
      update: { passwordHash, role: u.role },
      create: { name: u.name, email: u.email, passwordHash, role: u.role },
    });
  }
  console.log("✓ Test users ready");

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
