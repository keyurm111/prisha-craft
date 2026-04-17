const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Category name is required"],
    trim: true,
    unique: true
  },
  slug: {
    type: String,
    lowercase: true,
    unique: true
  },
  description: String,
  image: String, // Cover image URL or upload path
  ranking: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Product name is required"],
    trim: true
  },
  sku: {
    type: String,
    trim: true,
    unique: true,
    sparse: true // Allow multiple products without SKUs if needed, but uniqueness check for those that have it
  },
  slug: {
    type: String,
    lowercase: true,
    unique: true
  },
  description: {
    type: String,
    required: [true, "Product description is required"]
  },
  highlights: [String],
  price: {
    type: Number,
    required: [true, "Selling price is required"]
  },
  mrp: {
    type: Number,
    required: [true, "MRP is required"]
  },
  category: {
    type: mongoose.Schema.ObjectId,
    ref: "Category",
    required: [true, "Product must belong to a category"]
  },
  images: [String],
  mainImage: String,
  video: {
    type: String, // URL to video
    trim: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  stock: {
    type: Number,
    default: 0
  },
  specifications: {
    type: Map,
    of: String
  },
  shippingDimensions: {
    length: { type: Number, default: 0 }, // in cm
    width: { type: Number, default: 0 },  // in cm
    height: { type: Number, default: 0 }, // in cm
    weight: { type: Number, default: 0 }  // in kg
  },
  overallRanking: {
    type: Number,
    default: 0
  },
  categoryRanking: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

productSchema.virtual('discount').get(function() {
  if (this.mrp && this.price) {
    return Math.round(((this.mrp - this.price) / this.mrp) * 100);
  }
  return 0;
});

// Always include virtuals in JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

const Category = mongoose.model("Category", categorySchema);
const Product = mongoose.model("Product", productSchema);

module.exports = { Category, Product };
