const mongoose = require("mongoose");

// ⚠️ FIX PATH — change if your product model is elsewhere
const Product = require("./modules/product"); 
// example alternatives:
// const Product = require("./models/product");
// const Product = require("./product");

let faker;

// ------------------- MongoDB Connection -------------------
mongoose.connect("mongodb://localhost:27017/miniptoject", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// ------------------- Clothing Domain Data -------------------
const clothingBrands = [
  "Nike","Adidas","Puma","Zara","H&M","Levi's",
  "Gucci","Uniqlo","Under Armour","Tommy Hilfiger"
];

const clothingTypes = [
  "T-Shirt","Shirt","Jeans","Jacket","Hoodie",
  "Sweater","Shorts","Kurta","Dress","Blazer"
];

const clothingMaterials = [
  "Cotton","Denim","Polyester","Wool","Linen","Silk"
];

// real clothing images
const clothingImages = [
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
  "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f",
  "https://images.unsplash.com/photo-1503341504253-dff4815485f1",
  "https://images.unsplash.com/photo-1523381210434-271e8be1f52b",
  "https://images.unsplash.com/photo-1541099649105-f69ad21f3246"
];

// ------------------- Generate Random Ratings -------------------
const generateRatings = () => {
  const ratings = [];
  const count = faker.number.int({ min: 0, max: 5 });

  for (let i = 0; i < count; i++) {
    ratings.push({
      userid: new mongoose.Types.ObjectId(),
      rating: faker.number.float({
        min: 0.5,
        max: 5,
        multipleOf: 0.5
      })
    });
  }

  return ratings;
};

// ------------------- Seed Function -------------------
async function startSeeding() {
  try {
    console.log("Seeding clothing products...");

    // remove old products (optional)
    await Product.deleteMany();

    let products = [];

    for (let i = 0; i < 1000; i++) {
      const brand = faker.helpers.arrayElement(clothingBrands);
      const type = faker.helpers.arrayElement(clothingTypes);
      const material = faker.helpers.arrayElement(clothingMaterials);

      products.push({
        productbrand: brand,

        productname: `${brand} ${material} ${type}`,

        productdescription: `${material} ${type} made with premium quality fabric. Comfortable and stylish for everyday wear.`,

        productimage: [
          faker.helpers.arrayElement(clothingImages),
          faker.helpers.arrayElement(clothingImages)
        ],

        productrate: faker.number.int({ min: 499, max: 4999 }),

        productrating: generateRatings()
      });
    }

    await Product.insertMany(products);

    console.log("✅ 1000 clothing products inserted successfully");
    process.exit();

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

// ------------------- Load Faker (ESM Fix) -------------------
(async () => {
  faker = (await import("@faker-js/faker")).faker;
  startSeeding();
})();