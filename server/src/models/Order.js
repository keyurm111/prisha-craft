const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Order must belong to a user"]
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: [true, "Order item must have a product"]
      },
      quantity: {
        type: Number,
        required: [true, "Order item must have a quantity"],
        min: [1, "Quantity cannot be less than 1"]
      },
      price: {
        type: Number,
        required: [true, "Order item must have a price at time of purchase"]
      }
    }
  ],
  totalAmount: {
    type: Number,
    required: [true, "Order must have a total amount"]
  },
  couponCode: String,
  discountAmount: {
    type: Number,
    default: 0
  },
  shippingAddress: {
    fullName: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    postalCode: String,
    country: { type: String, default: "India" },
    phone: String
  },
  paymentMethod: {
    type: String,
    enum: ["COD", "Online"],
    default: "COD"
  },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Paid", "Failed", "Refunded"],
    default: "Pending"
  },
  transactionId: String,
  paymentDetails: {
    type: Map,
    of: String
  },
  shippingDimensions: {
    length: { type: Number, default: 0 }, // in cm
    width: { type: Number, default: 0 },  // in cm
    height: { type: Number, default: 0 }, // in cm
    weight: { type: Number, default: 0 }  // in kg
  },
  orderStatus: {
    type: String,
    enum: ["Processing", "Shipped", "Delivered", "Cancelled"],
    default: "Processing"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
