const dns = require("dns");

let cachedToken = null;
let tokenExpiry = null;

// Helper to determine if credentials are placeholder
function isPlaceholderCredentials() {
  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;
  return !email || !password || email.includes("example.com") || password.includes("password");
}

/**
 * Get cached Shiprocket JWT Token or request a new one
 */
async function getShiprocketToken() {
  if (isPlaceholderCredentials()) {
    console.log("Shiprocket: Using simulated environment (placeholder credentials detected)");
    return "SIMULATED_SHIPROCKET_JWT_TOKEN";
  }

  // Token is cached for up to 23 hours (expires in 24 hours)
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  try {
    const response = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD
      })
    });

    const data = await response.json();
    if (!response.ok || !data.token) {
      throw new Error(data.message || "Failed to log in to Shiprocket");
    }

    cachedToken = data.token;
    tokenExpiry = Date.now() + 23 * 60 * 60 * 1000; // 23 hours in ms
    return cachedToken;
  } catch (error) {
    console.error("Shiprocket Login Error:", error.message);
    throw error;
  }
}

/**
 * Query Courier Serviceability and rates
 */
async function checkServiceability(pickupPostcode, deliveryPostcode, weight, cod = 0) {
  if (isPlaceholderCredentials()) {
    // Return simulated courier choices for local testing
    return [
      {
        courier_name: "Delhivery Surface",
        rate: 65.0,
        etd: "3-5 Days",
        courier_company_id: 10
      },
      {
        courier_name: "BlueDart Express",
        rate: 120.0,
        etd: "1-2 Days",
        courier_company_id: 12
      }
    ];
  }

  try {
    const token = await getShiprocketToken();
    const url = new URL("https://apiv2.shiprocket.in/v1/external/courier/serviceability/");
    url.searchParams.append("pickup_postcode", pickupPostcode);
    url.searchParams.append("delivery_postcode", deliveryPostcode);
    url.searchParams.append("weight", weight.toString());
    url.searchParams.append("cod", cod.toString());

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await response.json();
    if (!response.ok || !data.data || !data.data.available_courier_companies) {
      // In case of incorrect credentials or invalid postcode
      throw new Error(data.message || "Failed to get serviceability data");
    }

    // Map to normalized structure
    return data.data.available_courier_companies.map(courier => ({
      courier_name: courier.courier_name,
      rate: parseFloat(courier.rate),
      etd: courier.etd || `${courier.estimated_delivery_days} Days`,
      courier_company_id: courier.courier_company_id
    }));
  } catch (error) {
    console.error("Shiprocket Serviceability Error:", error.message);
    // Return mock fallback as a fail-safe so UI does not crash if API goes down
    return [
      {
        courier_name: "Delhivery Standard (Fallback)",
        rate: 75.0,
        etd: "4-6 Days",
        courier_company_id: 10
      }
    ];
  }
}

/**
 * Create Order in Shiprocket
 */
async function createShiprocketOrder(order, shippingCost) {
  if (isPlaceholderCredentials()) {
    console.log(`Shiprocket: Simulating order push for MongoDB Order ID: ${order._id}`);
    return {
      shiprocket_order_id: "SR_MOCK_ORDER_" + Math.floor(Math.random() * 10000000),
      shipment_id: "SR_MOCK_SHIPMENT_" + Math.floor(Math.random() * 10000000)
    };
  }

  try {
    const token = await getShiprocketToken();
    const isCOD = order.paymentMethod === "COD" ? 1 : 0;
    
    // Construct items array format required by Shiprocket
    const orderItems = order.items.map(item => ({
      name: item.product?.name || "Product Item",
      sku: item.selectedVariant?.sku || item.product?.sku || `SKU-${item.product?._id || item.product}`,
      units: item.quantity,
      selling_price: item.price
    }));

    // Clean and validate customer names
    const fullName = order.shippingAddress.fullName || order.user?.name || "Customer";
    const nameParts = fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || "Customer";
    const lastName = nameParts.slice(1).join(" ").trim() || "Name";

    // Clean and format phone number: must be exactly 10 digits
    const cleanPhone = order.shippingAddress.phone.replace(/\D/g, "").slice(-10);

    // Clean and pad address: must be at least 10 characters long
    let cleanAddress = order.shippingAddress.addressLine1 || "";
    if (cleanAddress.length < 10) {
      if (order.shippingAddress.area) {
        cleanAddress += ", " + order.shippingAddress.area;
      }
      if (cleanAddress.length < 10) {
        cleanAddress = cleanAddress.padEnd(10, ".");
      }
    }

    const payload = {
      order_id: order._id.toString(),
      order_date: new Date(order.createdAt).toISOString().slice(0, 16).replace("T", " "),
      pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || "Primary",
      billing_customer_name: firstName,
      billing_last_name: lastName,
      billing_address: cleanAddress,
      billing_address_2: order.shippingAddress.area || "",
      billing_city: order.shippingAddress.city,
      billing_pincode: order.shippingAddress.postalCode,
      billing_state: order.shippingAddress.state,
      billing_country: order.shippingAddress.country || "India",
      billing_email: order.user?.email || "customer@meili.com",
      billing_phone: cleanPhone,
      shipping_is_billing: true,
      order_items: orderItems,
      payment_method: order.paymentMethod === "COD" ? "COD" : "Prepaid",
      sub_total: order.totalAmount - (shippingCost || 0),
      length: order.shippingDimensions?.length || 10,
      breadth: order.shippingDimensions?.width || 10,
      height: order.shippingDimensions?.height || 10,
      weight: order.shippingDimensions?.weight || 0.5
    };

    const response = await fetch("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    if (!response.ok || !data.order_id) {
      console.error("❌ Shiprocket Order Creation Rejected!");
      console.error("Payload sent:", JSON.stringify(payload, null, 2));
      console.error("Response received:", JSON.stringify(data, null, 2));
      
      let detailedError = data.message || "Failed to create Shiprocket order";
      if (data.errors) {
        const errorList = Object.entries(data.errors)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(", ") : msgs}`)
          .join(" | ");
        detailedError += ` (Details: ${errorList})`;
      }
      throw new Error(detailedError);
    }

    return {
      shiprocket_order_id: data.order_id.toString(),
      shipment_id: data.shipment_id.toString()
    };
  } catch (error) {
    console.error("Shiprocket Order Creation Error:", error.message);
    throw error;
  }
}

/**
 * Generate AWB Code (Air Waybill) for Shipment
 */
async function generateAwb(shipmentId, courierId = null) {
  if (isPlaceholderCredentials()) {
    return "AWB-MOCK-" + Math.floor(Math.random() * 1000000000);
  }

  try {
    const token = await getShiprocketToken();
    const payload = { shipment_id: shipmentId };
    if (courierId) {
      payload.courier_id = courierId;
    }

    const response = await fetch("https://apiv2.shiprocket.in/v1/external/courier/assign/awb", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok || !data.response || !data.response.data || !data.response.data.awb_code) {
      throw new Error(data.message || "Failed to allocate AWB code from Shiprocket");
    }

    return data.response.data.awb_code;
  } catch (error) {
    console.error("Shiprocket AWB Generation Error:", error.message);
    throw error;
  }
}

/**
 * Generate Shipping Label PDF URL
 */
async function generateLabel(shipmentId) {
  if (isPlaceholderCredentials()) {
    return "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
  }

  try {
    const token = await getShiprocketToken();
    const response = await fetch("https://apiv2.shiprocket.in/v1/external/courier/generate/label", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ shipment_id: [shipmentId] })
    });

    const data = await response.json();
    if (!response.ok || !data.label_url) {
      throw new Error(data.message || "Failed to generate label from Shiprocket");
    }

    return data.label_url;
  } catch (error) {
    console.error("Shiprocket Label Generation Error:", error.message);
    throw error;
  }
}

/**
 * Request Pickup Scheduling
 */
async function requestPickup(shipmentId) {
  if (isPlaceholderCredentials()) {
    return true;
  }

  try {
    const token = await getShiprocketToken();
    const response = await fetch("https://apiv2.shiprocket.in/v1/external/courier/generate/pickup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ shipment_id: [shipmentId] })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to generate pickup request from Shiprocket");
    }

    return true;
  } catch (error) {
    console.error("Shiprocket Pickup Request Error:", error.message);
    throw error;
  }
}

/**
 * Cancel Order in Shiprocket
 */
async function cancelShiprocketOrder(shiprocketOrderId) {
  if (isPlaceholderCredentials()) {
    console.log(`Shiprocket: Simulating shipment cancellation for Order ID ${shiprocketOrderId}`);
    return true;
  }

  try {
    const token = await getShiprocketToken();
    const response = await fetch("https://apiv2.shiprocket.in/v1/external/orders/cancel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ ids: [shiprocketOrderId] })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to cancel order in Shiprocket");
    }

    return true;
  } catch (error) {
    console.error("Shiprocket Order Cancellation Error:", error.message);
    throw error;
  }
}

module.exports = {
  checkServiceability,
  createShiprocketOrder,
  generateAwb,
  generateLabel,
  requestPickup,
  cancelShiprocketOrder
};
