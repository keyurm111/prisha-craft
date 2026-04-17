const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Blog title is required"],
    trim: true
  },
  slug: {
    type: String,
    lowercase: true,
    unique: true
  },
  summary: {
    type: String,
    required: [true, "Blog summary is required"]
  },
  content: {
    type: String,
    required: [true, "Blog content is required"]
  },
  image: {
    type: String,
    required: [true, "Blog image is required"]
  },
  author: {
    type: String,
    default: "Admin"
  },
  category: {
    type: String,
    default: "General"
  },
  tags: [String],
  status: {
    type: String,
    enum: ["Draft", "Published"],
    default: "Published"
  },
  featured: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create slug before saving
blogSchema.pre("save", function(next) {
  if (this.isModified("title") && !this.slug) {
    this.slug = this.title.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
  }
  next();
});

const Blog = mongoose.model("Blog", blogSchema);

module.exports = Blog;
