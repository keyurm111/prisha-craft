const Order = require("../models/Order");
const { Product } = require("../models/Product");
const Coupon = require("../models/Coupon");
const sendEmail = require("../utils/email");

exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, totalAmount, couponCode } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ status: "fail", message: "No items in order" });
    }

    let discountAmount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon && new Date() <= coupon.expiryDate && (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit)) {
        // Recalculate discount
        const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
        if (subtotal >= coupon.minPurchase) {
          if (coupon.discountType === "percentage") {
            discountAmount = (subtotal * coupon.discountValue) / 100;
          } else {
            discountAmount = coupon.discountValue;
          }
          // Increment usedCount
          coupon.usedCount += 1;
          await coupon.save();
        }
      }
    }

    // 1) Handle initial shipping dimensions for single-item orders
    let initialShippingDimensions = { length: 0, width: 0, height: 0, weight: 0 };
    if (items.length === 1) {
      const product = await Product.findById(items[0].product);
      if (product && product.shippingDimensions) {
        initialShippingDimensions = { ...product.shippingDimensions };
      }
    }

    // 2) Create Order
    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress,
      paymentMethod,
      totalAmount,
      couponCode,
      discountAmount,
      shippingDimensions: initialShippingDimensions
    });

    // 3) Update Product Stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    // 4) Notify Admin (Async)
    sendEmail({
      subject: `🚨 New Order Acquisition: #${order._id.toString().slice(-6).toUpperCase()}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #000; border-radius: 20px;">
          <h2 style="font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: -1px; margin-bottom: 5px;">New Masterpiece Order</h2>
          <p style="color: #666; font-style: italic; margin-bottom: 30px;">A new acquisition has been initiated on Meili.</p>
          
          <div style="background: #000; color: #fff; padding: 25px; border-radius: 15px; margin-bottom: 30px;">
            <p style="margin: 0; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; opacity: 0.6;">Total Value</p>
            <p style="margin: 5px 0 0; font-size: 32px; font-weight: 900;">₹${totalAmount.toLocaleString()}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse;">
             <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
                   <p style="margin: 0; font-size: 10px; text-transform: uppercase; font-weight: 900;">Order ID</p>
                   <p style="margin: 2px 0 0; font-size: 14px; color: #666;">#${order._id}</p>
                </td>
             </tr>
             <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
                   <p style="margin: 0; font-size: 10px; text-transform: uppercase; font-weight: 900;">Customer</p>
                   <p style="margin: 2px 0 0; font-size: 14px; color: #666;">${req.user.name} (${req.user.email})</p>
                </td>
             </tr>
             <tr>
                <td style="padding: 10px 0;">
                   <p style="margin: 0; font-size: 10px; text-transform: uppercase; font-weight: 900;">Payment</p>
                   <p style="margin: 2px 0 0; font-size: 14px; color: #666;">${paymentMethod.toUpperCase()}</p>
                </td>
             </tr>
          </table>

          <div style="margin-top: 40px; text-align: center;">
             <a href="${process.env.ADMIN_URL || '#'}/orders" style="display: inline-block; padding: 15px 30px; background: #000; color: #fff; text-decoration: none; border-radius: 10px; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">Review Order Logistics</a>
          </div>
        </div>
      `
    }).catch(err => console.error("Admin Email Failed:", err.message));

    res.status(201).json({
      status: "success",
      data: { order }
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort("-createdAt");
    res.status(200).json({
      status: "success",
      results: orders.length,
      data: { orders }
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.product", "name mainImage shippingDimensions")
      .sort("-createdAt");
      
    res.status(200).json({
      status: "success",
      results: orders.length,
      data: { orders }
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, paymentStatus, shippingDimensions } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus, paymentStatus, shippingDimensions },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ status: "fail", message: "Order not found" });
    }

    res.status(200).json({
      status: "success",
      data: { order }
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};
exports.deleteOrder = async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.status(204).json({ status: "success", data: null });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};
