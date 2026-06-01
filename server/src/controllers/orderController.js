const Order = require("../models/Order");
const { Product } = require("../models/Product");
const Coupon = require("../models/Coupon");
const User = require("../models/User");
const sendEmail = require("../utils/email");
const shiprocket = require("../utils/shiprocket");
const razorpay = require("../utils/razorpay");

exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, totalAmount: clientTotalAmount, couponCode, shippingFee: clientShippingFee } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ status: "fail", message: "No items in order" });
    }

    // 1) Verify and validate each item against Database (Task 3 & 4)
    let calculatedSubtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ status: "fail", message: `Product not found: ${item.product}` });
      }

      let actualPrice = product.price;
      let actualStock = product.stock;
      let variantName = "";

      if (item.selectedVariant && item.selectedVariant.id) {
        const variant = product.variants.find(
          v => String(v._id || v.id) === String(item.selectedVariant.id)
        );
        if (!variant) {
          return res.status(400).json({
            status: "fail",
            message: `Selected variant is invalid for product "${product.name}"`
          });
        }
        if (variant.price !== undefined && variant.price !== null) {
          actualPrice = variant.price;
        }
        actualStock = variant.stock;
        variantName = item.selectedVariant.name || "Default Option";
      }

      // Enforce Stock Audits (Task 4)
      if (actualStock < item.quantity) {
        return res.status(400).json({
          status: "fail",
          message: `Insufficient stock for product "${product.name}"${variantName ? ` (${variantName})` : ""}. Only ${actualStock} units available, but requested ${item.quantity}.`
        });
      }

      calculatedSubtotal += actualPrice * item.quantity;
      validatedItems.push({
        product: item.product,
        quantity: item.quantity,
        price: actualPrice,
        selectedVariant: item.selectedVariant
      });
    }

    // 2) Compute Coupon Discount securely on server (Task 3)
    let discountAmount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon && new Date() <= coupon.expiryDate && (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit)) {
        if (calculatedSubtotal >= coupon.minPurchase) {
          if (coupon.discountType === "percentage") {
            discountAmount = (calculatedSubtotal * coupon.discountValue) / 100;
          } else {
            discountAmount = coupon.discountValue;
          }
          // Increment usedCount
          coupon.usedCount += 1;
          await coupon.save();
        }
      }
    }

    // 3) Enforce positive shipping fee and calculate grand total
    const shippingFee = Math.max(0, Number(clientShippingFee) || 0);
    const calculatedGrandTotal = Math.max(0, calculatedSubtotal - discountAmount) + shippingFee;

    // 4) Handle initial shipping dimensions for single-item orders
    let initialShippingDimensions = { length: 0, width: 0, height: 0, weight: 0 };
    if (validatedItems.length === 1) {
      const product = await Product.findById(validatedItems[0].product);
      if (product && product.shippingDimensions) {
        initialShippingDimensions = { ...product.shippingDimensions };
      }
    }

    // 5) Create Order in Database (using calculatedGrandTotal to prevent price tampering!)
    const order = await Order.create({
      user: req.user._id,
      items: validatedItems,
      shippingAddress,
      paymentMethod,
      totalAmount: calculatedGrandTotal,
      couponCode,
      discountAmount,
      shippingDimensions: initialShippingDimensions
    });

    let razorpayOrderData = null;

    if (paymentMethod === "COD") {
      try {
        const isSingleProduct = order.items.length === 1 && order.items[0].quantity === 1;
        if (isSingleProduct) {
          // Auto-ship immediately!
          const shippingController = require("./shippingController");
          await shippingController.triggerAutoShipping(order._id);
        } else {
          // Multi-product order, stays in Processing (waiting for dimensions to be entered by Admin)
          order.orderStatus = "Processing";
          await order.save();
        }
      } catch (err) {
        console.error("Failed to auto-ship COD order to Shiprocket:", err.message);
        order.orderStatus = "Processing";
        await order.save();
      }
    } else if (paymentMethod === "Online") {
      try {
        const rpResult = await razorpay.createRazorpayOrder(calculatedGrandTotal, order._id.toString());
        order.razorpayOrderId = rpResult.razorpayOrderId;
        await order.save();

        razorpayOrderData = {
          id: rpResult.razorpayOrderId,
          amount: rpResult.amount,
          currency: rpResult.currency,
          keyId: process.env.RAZORPAY_KEY_ID
        };
      } catch (err) {
        // Rollback stock decrement and coupon usage, then delete order if payment gateway setup fails
        for (const item of validatedItems) {
          if (item.selectedVariant && item.selectedVariant.id) {
            await Product.updateOne(
              { _id: item.product, "variants._id": item.selectedVariant.id },
              { $inc: { "variants.$.stock": item.quantity } }
            ).catch(e => console.error("Rollback error:", e));
          } else {
            await Product.findByIdAndUpdate(item.product, {
              $inc: { stock: item.quantity }
            }).catch(e => console.error("Rollback error:", e));
          }
        }
        if (couponCode) {
          await Coupon.updateOne(
            { code: couponCode.toUpperCase() },
            { $inc: { usedCount: -1 } }
          ).catch(e => console.error("Rollback error:", e));
          await Coupon.updateOne(
            { code: couponCode.toUpperCase(), usedCount: { $lt: 0 } },
            { $set: { usedCount: 0 } }
          ).catch(e => {});
        }
        await Order.findByIdAndDelete(order._id);
        return res.status(400).json({
          status: "fail",
          message: "Failed to initiate payment gateway: " + err.message
        });
      }
    }

    // 6) Update Product Stock (We already validated that stock is fully available)
    for (const item of validatedItems) {
      if (item.selectedVariant && item.selectedVariant.id) {
        await Product.updateOne(
          { _id: item.product, "variants._id": item.selectedVariant.id },
          { $inc: { "variants.$.stock": -item.quantity } }
        );
      } else {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity }
        });
      }
    }

    // 7) Notify Admin (Async)
    sendEmail({
      subject: `🚨 New Order Acquisition: #${order._id.toString().slice(-6).toUpperCase()}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #000; border-radius: 20px;">
          <h2 style="font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: -1px; margin-bottom: 5px;">New Masterpiece Order</h2>
          <p style="color: #666; font-style: italic; margin-bottom: 30px;">A new acquisition has been initiated on Meili.</p>
          
          <div style="background: #000; color: #fff; padding: 25px; border-radius: 15px; margin-bottom: 30px;">
            <p style="margin: 0; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; opacity: 0.6;">Total Value</p>
            <p style="margin: 5px 0 0; font-size: 32px; font-weight: 900;">₹${calculatedGrandTotal.toLocaleString()}</p>
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

    // 8) Update user profile if shippingAddress or phone is empty
    let updatedUser = req.user;
    const user = await User.findById(req.user._id);
    if (user) {
      let userUpdated = false;
      if (!user.phone && shippingAddress.phone) {
        user.phone = shippingAddress.phone;
        userUpdated = true;
      }
      if ((!user.shippingAddress || !user.shippingAddress.addressLine1) && shippingAddress.addressLine1) {
        user.shippingAddress = {
          addressLine1: shippingAddress.addressLine1,
          area: shippingAddress.area || "",
          city: shippingAddress.city || "",
          state: shippingAddress.state || "",
          postalCode: shippingAddress.postalCode || "",
          country: "India"
        };
        userUpdated = true;
      }
      if (userUpdated) {
        updatedUser = await user.save({ validateBeforeSave: false });
        updatedUser.password = undefined;
      }
    }

    res.status(201).json({
      status: "success",
      data: { 
        order,
        user: updatedUser,
        razorpay: razorpayOrderData
      }
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
      $or: [
        { paymentMethod: "COD" },
        { paymentMethod: "Online", paymentStatus: { $in: ["Paid", "Refund Pending", "Refund Initiated", "Refunded", "Refund Failed"] } }
      ]
    })
      .populate("items.product", "name mainImage variants")
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

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [
        { paymentMethod: "COD" },
        { paymentMethod: "Online", paymentStatus: { $in: ["Paid", "Refund Pending", "Refund Initiated", "Refunded", "Refund Failed"] } }
      ]
    })
      .populate("user", "name email")
      .populate("items.product", "name mainImage shippingDimensions variants")
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
    )
      .populate("user", "name email")
      .populate("items.product", "name mainImage shippingDimensions variants");

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
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ status: "fail", message: "Order not found" });
    }

    // Block deletion if order is already shipped or delivered
    if (order.orderStatus === "Shipped" || order.orderStatus === "Delivered") {
      return res.status(400).json({ 
        status: "fail", 
        message: "Cannot delete order once it has been shipped or delivered." 
      });
    }

    // Sync with Shiprocket cancellation if synced to Shiprocket
    if (order.shiprocketOrderId) {
      try {
        await shiprocket.cancelShiprocketOrder(order.shiprocketOrderId);
      } catch (err) {
        console.error(`Failed to sync cancellation with Shiprocket for Order ${order._id}:`, err.message);
      }
    }

    // Only restore inventory/coupon if the order wasn't already cancelled
    if (order.orderStatus !== "Cancelled") {
      // 1) Restore Stock
      for (const item of order.items) {
        if (item.selectedVariant && item.selectedVariant.id) {
          await Product.updateOne(
            { _id: item.product, "variants._id": item.selectedVariant.id },
            { $inc: { "variants.$.stock": item.quantity } }
          ).catch(err => console.error("Restore stock error:", err.message));
        } else {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: item.quantity }
          }).catch(err => console.error("Restore stock error:", err.message));
        }
      }

      // 2) Restore Coupon usage count
      if (order.couponCode) {
        await Coupon.updateOne(
          { code: order.couponCode.toUpperCase() },
          { $inc: { usedCount: -1 } }
        ).catch(err => console.error("Restore coupon error:", err.message));
        await Coupon.updateOne(
          { code: order.couponCode.toUpperCase(), usedCount: { $lt: 0 } },
          { $set: { usedCount: 0 } }
        ).catch(err => {});
      }
    }

    await Order.findByIdAndDelete(req.params.id);
    res.status(204).json({ status: "success", data: null });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const { cancellationReason } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ status: "fail", message: "Order not found" });
    }

    // Security Authorization Check: Owner or Admin only
    const isOwner = req.user && String(order.user) === String(req.user._id);
    const isAdmin = req.user && req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ status: "fail", message: "You are not authorized to cancel this order" });
    }

    if (order.orderStatus === "Cancelled") {
      return res.status(200).json({ status: "success", message: "Order is already cancelled", data: { order } });
    }

    // Allow cancelling only if order is in "Processing" status
    if (order.orderStatus !== "Processing") {
      return res.status(400).json({ 
        status: "fail", 
        message: `Cannot cancel order at this stage. Current shipping status: ${order.orderStatus}` 
      });
    }

    // Sync with Shiprocket cancellation if already synced
    if (order.shiprocketOrderId) {
      try {
        await shiprocket.cancelShiprocketOrder(order.shiprocketOrderId);
      } catch (err) {
        console.error(`Failed to sync cancellation with Shiprocket for Order ${order._id}:`, err.message);
      }
    }

    order.orderStatus = "Cancelled";
    order.cancellationReason = cancellationReason || "No reason specified";
    
    // If it was already paid online, mark as Refund Pending and attempt refund
    if (order.paymentStatus === "Paid") {
      order.paymentStatus = "Refund Pending";
      order.refundError = undefined;
      await order.save();

      // Retrieve payment/transaction ID from transactionId or paymentDetails map
      const paymentId = order.transactionId || order.paymentDetails?.get?.("razorpay_payment_id") || order.paymentDetails?.razorpay_payment_id;

      if (paymentId) {
        try {
          const refundResult = await razorpay.createRazorpayRefund(
            paymentId,
            order.totalAmount,
            `ref_${order._id}`
          );
          
          if (refundResult.status === "processed" || refundResult.status === "refunded") {
            order.paymentStatus = "Refunded";
          } else {
            order.paymentStatus = "Refund Initiated";
          }
        } catch (refundErr) {
          console.error("Automated Refund Failed:", refundErr.message);
          order.paymentStatus = "Refund Failed";
          order.refundError = refundErr.message || "Unknown Razorpay error";
        }
      } else {
        console.error("Refund Failed: Missing payment transaction ID");
        order.paymentStatus = "Refund Failed";
        order.refundError = "Missing transaction ID for online payment";
      }
    } else {
      order.paymentStatus = "Failed";
    }
    
    await order.save();

    // Restore stock
    for (const item of order.items) {
      if (item.selectedVariant && item.selectedVariant.id) {
        await Product.updateOne(
          { _id: item.product, "variants._id": item.selectedVariant.id },
          { $inc: { "variants.$.stock": item.quantity } }
        );
      } else {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity }
        });
      }
    }

    // Restore Coupon usage count
    if (order.couponCode) {
      await Coupon.updateOne(
        { code: order.couponCode.toUpperCase() },
        { $inc: { usedCount: -1 } }
      ).catch(err => console.error("Restore coupon error:", err.message));
      await Coupon.updateOne(
        { code: order.couponCode.toUpperCase(), usedCount: { $lt: 0 } },
        { $set: { usedCount: 0 } }
      ).catch(err => {});
    }

    res.status(200).json({
      status: "success",
      message: "Order cancelled and stock restored successfully",
      data: { order }
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

exports.retryRefund = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ status: "fail", message: "Order not found" });
    }

    // Only administrators can retry a failed refund
    if (req.user?.role !== "admin") {
      return res.status(403).json({ status: "fail", message: "Only administrators can retry refunds" });
    }

    if (order.paymentStatus !== "Refund Failed") {
      return res.status(400).json({ 
        status: "fail", 
        message: `Order payment status is ${order.paymentStatus}, not Refund Failed.` 
      });
    }

    const paymentId = order.transactionId || order.paymentDetails?.get?.("razorpay_payment_id") || order.paymentDetails?.razorpay_payment_id;
    if (!paymentId) {
      return res.status(400).json({ status: "fail", message: "Order is missing Razorpay payment transaction ID" });
    }

    order.paymentStatus = "Refund Pending";
    order.refundError = undefined;
    await order.save();

    try {
      const refundResult = await razorpay.createRazorpayRefund(
        paymentId,
        order.totalAmount,
        `ref_${order._id}_retry_${Date.now()}` // add timestamp suffix for retry uniqueness
      );

      if (refundResult.status === "processed" || refundResult.status === "refunded") {
        order.paymentStatus = "Refunded";
      } else {
        order.paymentStatus = "Refund Initiated";
      }
      await order.save();

      res.status(200).json({
        status: "success",
        message: "Refund retried successfully",
        data: { order }
      });
    } catch (refundErr) {
      console.error("Retried Refund Failed:", refundErr.message);
      order.paymentStatus = "Refund Failed";
      order.refundError = refundErr.message || "Unknown Razorpay error during retry";
      await order.save();

      res.status(400).json({
        status: "fail",
        message: `Refund retry failed: ${refundErr.message}`
      });
    }
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};
