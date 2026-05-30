const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const Testimonial = require("./models/Testimonial");

const seedTestimonials = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB...");
    
    // Clear existing testimonials
    await Testimonial.deleteMany({});
    
    const testimonials = [
      { 
        name: "Aditya Sharma", 
        role: "Fashion Stylist", 
        rating: 5, 
        content: "The craftsmanship of Prisha Crafts bags is exceptional. The leather quality and stitching are truly world-class.", 
        featured: true, 
        order: 0 
      },
      { 
        name: "Priya Mehta", 
        role: "Boutique Owner", 
        rating: 5, 
        content: "As a boutique owner, finding a manufacturer with this level of attention to detail was a game-changer for our brand.", 
        featured: true, 
        order: 1 
      },
      { 
        name: "Vikram Goel", 
        role: "Long-time Customer", 
        rating: 5, 
        content: "I've used their handcrafted totes for years. They aged beautifully and are still my most durable accessories.", 
        featured: true, 
        order: 2 
      },
      { 
        name: "Sanya Kapoor", 
        role: "Retail Buyer", 
        rating: 5, 
        content: "Prisha Crafts handled our bulk order with incredible efficiency. The samples and final products were identical and perfect.", 
        featured: true, 
        order: 3 
      },
      { 
        name: "Rahul Verma", 
        role: "Accessories Designer", 
        rating: 5, 
        content: "A masterclass in artisanal manufacturing. They understand the balance between modern design and traditional techniques.", 
        featured: true, 
        order: 4 
      },
    ];
    
    await Testimonial.insertMany(testimonials);
    console.log("✅ Successfully seeded 5 dynamic testimonials!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to seed testimonials:", err);
    process.exit(1);
  }
};

seedTestimonials();
