import mongoose from 'mongoose';

const uri = 'mongodb://localhost:27017/Paioner_db'; // Change if your MongoDB URI is different

const categorySchema = new mongoose.Schema({
  name: { type: String, unique: true },
  description: String,
  featured: Boolean,
  order: Number,
  image: String,
  isActive: Boolean,
  productCount: Number,
  createdAt: Date,
  updatedAt: Date
});

const Category = mongoose.model('Category', categorySchema);

const categories = [
  {
    name: "Smartphones",
    description: "Latest AI-powered devices",
    featured: true,
    order: 1
  },
  {
    name: "Laptops",
    description: "Professional computing power",
    featured: false,
    order: 2
  },
  {
    name: "Gaming",
    description: "Ultimate gaming experience",
    featured: true,
    order: 3
  },
  {
    name: "Smart Home",
    description: "Connected living spaces",
    featured: true,
    order: 4
  },
  {
    name: "Audio",
    description: "Immersive sound experience",
    featured: false,
    order: 5
  },
  {
    name: "Tablets",
    description: "Portable productivity",
    featured: false,
    order: 6
  }
];

async function upsertCategories() {
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  for (const cat of categories) {
    await Category.updateOne(
      { name: cat.name },
      {
        $setOnInsert: {
          ...cat,
          image: "",
          isActive: true,
          productCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );
    console.log(`Upserted: ${cat.name}`);
  }
  await mongoose.disconnect();
  console.log('Done!');
}

upsertCategories(); 