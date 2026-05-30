const Order = require("../models/Order");
const razorpay = require("../utils/razorpay");
const shiprocket = require("../utils/shiprocket");

/**
 * Verify Razorpay payment signature from client checkout
 */
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        status: "fail",
        message: "Missing Razorpay payment verification details"
      });
    }

    // 1) Verify signature cryptographic hash
    const isValid = razorpay.verifySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return res.status(400).json({
        status: "fail",
        message: "Payment signature verification failed. Possible fraud attempt."
      });
    }

    // 2) Find the corresponding order in our DB
    const order = await Order.findOne({ razorpayOrderId: razorpay_order_id }).populate("items.product");
    if (!order) {
      return res.status(404).json({
        status: "fail",
        message: "Corresponding order details not found for payment"
      });
    }

    // 3) Update status to Paid
    if (order.paymentStatus !== "Paid") {
      order.paymentStatus = "Paid";
      order.transactionId = razorpay_payment_id;
      order.orderStatus = "Processing";
      
      // Save signature elements to payment details map
      order.paymentDetails = {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      };
      
      // Save payment status first so database gets updated to "Paid" before triggerAutoShipping queries it
      await order.save();
      
      // 4) Push prepaid shipment directly to Shiprocket if single item
      try {
        const isSingleProduct = order.items.length === 1 && order.items[0].quantity === 1;
        if (isSingleProduct) {
          const shippingController = require("./shippingController");
          await shippingController.triggerAutoShipping(order._id);
        }
      } catch (err) {
        console.error("Failed to auto-ship prepaid order to Shiprocket:", err.message);
      }
    }

    const finalOrder = await Order.findById(order._id);

    res.status(200).json({
      status: "success",
      message: "Payment verified and order updated successfully",
      data: {
        order: finalOrder
      }
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

/**
 * Handle Razorpay Webhooks (Resiliency)
 */
exports.handleWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Optional signature checking (only if secret is defined in environment variables)
    if (webhookSecret && signature) {
      const rawBody = req.rawBody || JSON.stringify(req.body);
      const isVerified = razorpay.verifyWebhookSignature(rawBody, signature, webhookSecret);
      if (!isVerified) {
        return res.status(400).json({ status: "fail", message: "Invalid webhook signature" });
      }
    }

    const event = req.body.event;
    const payload = req.body.payload;

    if (event === "order.paid" || event === "payment.captured") {
      const paymentEntity = payload.payment.entity;
      const razorpayOrderId = paymentEntity.order_id;
      const razorpayPaymentId = paymentEntity.id;

      // Find the corresponding order
      const order = await Order.findOne({ razorpayOrderId }).populate("items.product");
      if (order && order.paymentStatus !== "Paid") {
        order.paymentStatus = "Paid";
        order.transactionId = razorpayPaymentId;
        order.orderStatus = "Processing";
        
        // Save payment status first so database gets updated to "Paid" before triggerAutoShipping queries it
        await order.save();
        
        // Push prepaid shipment to Shiprocket if single item
        try {
          const isSingleProduct = order.items.length === 1 && order.items[0].quantity === 1;
          if (isSingleProduct) {
            const shippingController = require("./shippingController");
            await shippingController.triggerAutoShipping(order._id);
          }
        } catch (err) {
          console.error("Failed to push prepaid order to Shiprocket via Webhook:", err.message);
        }
      }
    } else if (event === "refund.processed") {
      const refundEntity = payload.refund.entity;
      const paymentId = refundEntity.payment_id;

      let order = await Order.findOne({ transactionId: paymentId });
      if (!order && refundEntity.notes && refundEntity.notes.order_id) {
        order = await Order.findById(refundEntity.notes.order_id);
      }

      if (order) {
        order.paymentStatus = "Refunded";
        order.refundError = undefined;
        await order.save();
        console.log(`Webhook: Order ${order._id} successfully marked as Refunded.`);
      }
    } else if (event === "refund.failed") {
      const refundEntity = payload.refund.entity;
      const paymentId = refundEntity.payment_id;

      let order = await Order.findOne({ transactionId: paymentId });
      if (!order && refundEntity.notes && refundEntity.notes.order_id) {
        order = await Order.findById(refundEntity.notes.order_id);
      }

      if (order) {
        order.paymentStatus = "Refund Failed";
        order.refundError = refundEntity.error_description || "Refund rejected by bank";
        await order.save();
        console.log(`Webhook: Order ${order._id} marked as Refund Failed.`);
      }
    }

    // Always return a 200 to Razorpay to acknowledge receipt
    res.status(200).json({ status: "success" });
  } catch (err) {
    console.error("Webhook processing error:", err.message);
    res.status(200).json({ status: "success", warning: err.message }); // Still send 200 so gateway doesn't retry
  }
};
