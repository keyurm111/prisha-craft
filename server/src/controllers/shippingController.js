const Order = require("../models/Order");
const { Product } = require("../models/Product");
const shiprocket = require("../utils/shiprocket");
const ShippingRange = require("../models/ShippingRange");

/**
 * Calculate custom range-based shipping rates for checkout
 */
exports.calculateRates = async (req, res) => {
  try {
    const { items, deliveryPostcode, cod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ status: "fail", message: "No items in card" });
    }
    if (!deliveryPostcode) {
      return res.status(400).json({ status: "fail", message: "Pincode is required" });
    }

    // 1) Fetch product details from DB to get their shipping weights & dimensions
    let totalWeight = 0;
    let maxLength = 0;
    let maxWidth = 0;
    let totalHeight = 0;

    for (const item of items) {
      const product = await Product.findById(item.product || item.id);
      if (product) {
        const qty = item.quantity || 1;
        const dims = product.shippingDimensions || {};
        totalWeight += (dims.weight || 0.5) * qty;
        maxLength = Math.max(maxLength, dims.length || 10);
        maxWidth = Math.max(maxWidth, dims.width || 10);
        totalHeight += (dims.height || 10) * qty;
      }
    }

    // Apply absolute minimums if data is missing
    if (totalWeight <= 0) totalWeight = 0.5;
    if (maxLength <= 0) maxLength = 10;
    if (maxWidth <= 0) maxWidth = 10;
    if (totalHeight <= 0) totalHeight = 10;

    // Convert total weight (in kg) to grams for matching the admin ranges
    const totalWeightGrams = totalWeight * 1000;

    // 2) Find matching shipping range rule
    const ranges = await ShippingRange.find().sort({ minWeight: 1 });
    let matchedCost = 0; // default to free shipping

    if (ranges.length > 0) {
      const matchedRange = ranges.find(
        r => totalWeightGrams >= r.minWeight && totalWeightGrams <= r.maxWeight
      );
      if (matchedRange) {
        matchedCost = matchedRange.cost;
      } else {
        // Fallback: If no range directly matches, use the highest range cost
        const highestRange = ranges[ranges.length - 1];
        matchedCost = highestRange.cost;
      }
    }

    res.status(200).json({
      status: "success",
      data: {
        rates: [
          {
            rate: matchedCost,
            courier_name: "Standard Shipping",
            etd: "3-7 Days"
          }
        ],
        packageMetrics: {
          weight: totalWeight,
          length: maxLength,
          width: maxWidth,
          height: totalHeight
        }
      }
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

/**
 * Get all shipping weight ranges (Admin)
 */
exports.getShippingRanges = async (req, res) => {
  try {
    const ranges = await ShippingRange.find().sort({ minWeight: 1 });
    res.status(200).json({
      status: "success",
      data: {
        ranges
      }
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

/**
 * Create a new shipping weight range (Admin)
 */
exports.createShippingRange = async (req, res) => {
  try {
    const { minWeight, maxWeight, cost } = req.body;

    if (Number(minWeight) >= Number(maxWeight)) {
      return res.status(400).json({
        status: "fail",
        message: "Minimum weight must be less than maximum weight"
      });
    }

    const newRange = await ShippingRange.create({ minWeight, maxWeight, cost });
    res.status(201).json({
      status: "success",
      data: {
        range: newRange
      }
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

/**
 * Update an existing shipping weight range (Admin)
 */
exports.updateShippingRange = async (req, res) => {
  try {
    const { minWeight, maxWeight, cost } = req.body;

    if (minWeight !== undefined && maxWeight !== undefined && Number(minWeight) >= Number(maxWeight)) {
      return res.status(400).json({
        status: "fail",
        message: "Minimum weight must be less than maximum weight"
      });
    }

    const range = await ShippingRange.findByIdAndUpdate(
      req.params.id,
      { minWeight, maxWeight, cost },
      { new: true, runValidators: true }
    );

    if (!range) {
      return res.status(404).json({ status: "fail", message: "Shipping range not found" });
    }

    res.status(200).json({
      status: "success",
      data: {
        range
      }
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

/**
 * Delete a shipping weight range (Admin)
 */
exports.deleteShippingRange = async (req, res) => {
  try {
    const range = await ShippingRange.findByIdAndDelete(req.params.id);
    if (!range) {
      return res.status(404).json({ status: "fail", message: "Shipping range not found" });
    }

    res.status(204).json({
      status: "success",
      data: null
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

/**
 * Automated Shiprocket Logistics and Courier Routing Pipeline
 * 1) Pushes the order to Shiprocket (adhoc order creation)
 * 2) Queries Courier Serviceability live to retrieve all available courier rates
 * 3) Automatically identifies the cheapest courier company option
 * 4) Assigns the AWB code using that cheapest courier partner's ID
 * 5) Transitions orderStatus to "Shipped" and saves the references to the database
 */
exports.triggerAutoShipping = async (orderId) => {
  const Order = require("../models/Order");
  const shiprocket = require("../utils/shiprocket");

  const order = await Order.findById(orderId).populate("items.product");
  if (!order) throw new Error("Order not found");

  let shiprocketOrderId = order.shiprocketOrderId;
  let shiprocketShipmentId = order.shiprocketShipmentId;

  // 1. Push order to Shiprocket if not already done
  if (!shiprocketOrderId) {
    const result = await shiprocket.createShiprocketOrder(order, 0);
    shiprocketOrderId = result.shiprocket_order_id;
    shiprocketShipmentId = result.shipment_id;
    order.shiprocketOrderId = shiprocketOrderId;
    order.shiprocketShipmentId = shiprocketShipmentId;
    await order.save();
  }

  // 2. Fetch live courier serviceability rates to find the cheapest partner
  const pickupPostcode = process.env.SHIPROCKET_PICKUP_POSTCODE || "110001";
  const deliveryPostcode = order.shippingAddress.postalCode;
  
  // Sum item weights
  let totalWeight = 0;
  for (const item of order.items) {
    const qty = item.quantity || 1;
    const productWeight = item.product?.shippingDimensions?.weight || order.shippingDimensions?.weight || 0.5;
    totalWeight += productWeight * qty;
  }
  if (totalWeight <= 0) totalWeight = 0.5;

  const codFlag = order.paymentMethod === "COD" ? 1 : 0;

  let rates = [];
  try {
    rates = await shiprocket.checkServiceability(
      pickupPostcode,
      deliveryPostcode,
      totalWeight,
      codFlag
    );
  } catch (err) {
    console.error("Auto Shipping: Serviceability query failed:", err.message);
  }

  // 3. Automatically select cheapest partner and assign AWB code
  if (rates && rates.length > 0) {
    const cheapest = rates.reduce((min, r) => r.rate < min.rate ? r : min, rates[0]);
    
    try {
      const awbCode = await shiprocket.generateAwb(shiprocketShipmentId, cheapest.courier_company_id);
      order.shiprocketAwbCode = awbCode;
      order.shiprocketTrackingUrl = `https://www.shiprocket.in/shipment-tracking/${awbCode}`;
      order.orderStatus = "Shipped";
    } catch (awbErr) {
      console.error("Auto Shipping: AWB assignment failed:", awbErr.message);
      // Fallback: Try general AWB generation without specific courier
      try {
        const awbCode = await shiprocket.generateAwb(shiprocketShipmentId);
        order.shiprocketAwbCode = awbCode;
        order.shiprocketTrackingUrl = `https://www.shiprocket.in/shipment-tracking/${awbCode}`;
        order.orderStatus = "Shipped";
      } catch (fallbackErr) {
        console.error("Auto Shipping: Fallback AWB assignment also failed:", fallbackErr.message);
      }
    }
  } else {
    // If no rates were retrieved, try standard AWB assignment as fallback
    try {
      const awbCode = await shiprocket.generateAwb(shiprocketShipmentId);
      order.shiprocketAwbCode = awbCode;
      order.shiprocketTrackingUrl = `https://www.shiprocket.in/shipment-tracking/${awbCode}`;
      order.orderStatus = "Shipped";
    } catch (err) {
      console.error("Auto Shipping: No rates and standard AWB assignment failed:", err.message);
    }
  }

  await order.save();
  return order;
};

/**
 * Push existing MongoDB Order to Shiprocket (Admin action)
 */
exports.pushOrderToShiprocket = async (req, res) => {
  try {
    const { orderId } = req.body;
    
    // Trigger auto-shipping (which pushes, selects cheapest courier, assigns AWB, and marks Shipped)
    const order = await exports.triggerAutoShipping(orderId);

    res.status(200).json({
      status: "success",
      message: "Order successfully processed and shipped via Shiprocket",
      data: {
        order
      }
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

/**
 * Assign AWB tracking number to shipment (Admin action)
 */
exports.assignAwb = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ status: "fail", message: "Order not found" });
    }
    if (!order.shiprocketShipmentId) {
      return res.status(400).json({ status: "fail", message: "Order must be pushed to Shiprocket first" });
    }

    // Assign AWB
    const awbCode = await shiprocket.generateAwb(order.shiprocketShipmentId);
    
    // Save to order
    order.shiprocketAwbCode = awbCode;
    order.shiprocketTrackingUrl = `https://www.shiprocket.in/shipment-tracking/${awbCode}`;
    order.orderStatus = "Shipped"; // Auto-transition status
    await order.save();

    res.status(200).json({
      status: "success",
      message: "AWB tracking code assigned successfully",
      data: {
        order
      }
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

/**
 * Generate Shipping Label PDF (Admin action)
 */
exports.generateLabel = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ status: "fail", message: "Order not found" });
    }
    if (!order.shiprocketShipmentId) {
      return res.status(400).json({ status: "fail", message: "Order must be synced with Shiprocket first" });
    }

    // Retrieve label PDF URL
    const labelUrl = await shiprocket.generateLabel(order.shiprocketShipmentId);
    
    order.shiprocketLabelUrl = labelUrl;
    await order.save();

    res.status(200).json({
      status: "success",
      message: "Label PDF generated successfully",
      data: {
        labelUrl
      }
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

/**
 * Schedule Pickup for courier delivery (Admin action)
 */
exports.schedulePickup = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ status: "fail", message: "Order not found" });
    }
    if (!order.shiprocketShipmentId) {
      return res.status(400).json({ status: "fail", message: "Order must be synced with Shiprocket first" });
    }

    await shiprocket.requestPickup(order.shiprocketShipmentId);

    res.status(200).json({
      status: "success",
      message: "Courier pickup requested successfully"
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};
