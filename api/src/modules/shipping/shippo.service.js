import crypto from "node:crypto";
import { env } from "../../config/env.js";

const SHIPPO_API_BASE = "https://api.goshippo.com";

/**
 * Helper to check if a real Shippo key is provided.
 */
function isConfiguredShippoKey(key) {
  return typeof key === "string" && key.trim().length > 15 && !key.includes("placeholder");
}

/**
 * Standard Shippo HTTP client.
 */
async function shippoFetch(endpoint, options = {}) {
  const apiKey = env.shippoApiKey;
  const isMock = !isConfiguredShippoKey(apiKey);

  if (isMock) {
    // Graceful offline mock responses for local dev / testing
    return handleMockShippoRequest(endpoint, options);
  }

  const url = endpoint.startsWith("http") ? endpoint : `${SHIPPO_API_BASE}${endpoint}`;
  const headers = {
    "Authorization": `ShippoToken ${apiKey}`,
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  const text = await response.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }

  if (!response.ok) {
    const errorMsg = json?.messages?.map(m => m?.text || m)?.join(", ") || 
                     json?.error || 
                     json?.detail || 
                     `Shippo API error (${response.status})`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.details = json;
    throw error;
  }

  return json;
}

/**
 * Offline Mock Engine for Development & Automated Testing
 * Supports realistic US & Canada addresses, rates, tracking, and label URLs
 */
function handleMockShippoRequest(endpoint, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const body = options.body ? JSON.parse(options.body) : {};

  // 1. Address Validation
  if (endpoint.includes("/addresses") && method === "POST") {
    const isCa = (body.country || "").toUpperCase() === "CA";
    const isValid = !!(body.street1 && body.city && (body.zip || body.postalCode));
    return {
      object_id: `addr_mock_${Date.now()}`,
      is_complete: true,
      validation_results: {
        is_valid: isValid,
        messages: isValid ? [] : [{ text: "Address line 1, city, and postal code are required.", code: "InvalidAddress" }]
      },
      name: body.name || "Customer",
      company: body.company || null,
      street1: body.street1 || "350 5th Ave",
      street2: body.street2 || null,
      city: body.city || (isCa ? "Toronto" : "New York"),
      state: body.state || (isCa ? "ON" : "NY"),
      zip: body.zip || body.postalCode || (isCa ? "M5H 2N2" : "10118"),
      country: isCa ? "CA" : "US",
      phone: body.phone || "+1 555-0199",
      email: body.email || null
    };
  }

  // 2. Shipment & Rates Creation
  if (endpoint.includes("/shipments") && method === "POST") {
    const destCountry = body.address_to?.country || "US";
    const currency = destCountry === "CA" ? "CAD" : "USD";
    const shipmentId = `shp_mock_${Date.now()}`;

    const rates = [
      {
        object_id: `rate_mock_usps_priority_${Date.now()}`,
        shipment: shipmentId,
        provider: destCountry === "CA" ? "Canada Post" : "USPS",
        servicelevel: {
          name: destCountry === "CA" ? "Regular Parcel" : "Priority Mail",
          token: "priority"
        },
        amount: destCountry === "CA" ? "14.50" : "9.85",
        currency,
        estimated_days: 2,
        duration_terms: "2-3 business days"
      },
      {
        object_id: `rate_mock_ups_ground_${Date.now()}`,
        shipment: shipmentId,
        provider: "UPS",
        servicelevel: {
          name: "UPS Ground",
          token: "ups_ground"
        },
        amount: destCountry === "CA" ? "18.20" : "12.50",
        currency,
        estimated_days: 4,
        duration_terms: "3-5 business days"
      },
      {
        object_id: `rate_mock_fedex_express_${Date.now()}`,
        shipment: shipmentId,
        provider: "FedEx",
        servicelevel: {
          name: "FedEx 2Day",
          token: "fedex_2day"
        },
        amount: destCountry === "CA" ? "26.00" : "21.00",
        currency,
        estimated_days: 1,
        duration_terms: "1-2 business days"
      }
    ];

    return {
      object_id: shipmentId,
      status: "SUCCESS",
      address_from: body.address_from,
      address_to: body.address_to,
      parcels: body.parcels || [],
      rates,
      messages: []
    };
  }

  // 3. Transactions / Label Creation
  if (endpoint.includes("/transactions") && method === "POST") {
    const rateId = body.rate || `rate_mock_${Date.now()}`;
    const carrier = rateId.includes("ups") ? "UPS" : rateId.includes("fedex") ? "FedEx" : "USPS";
    const trackingNumber = carrier === "UPS" 
      ? `1Z99999999${Math.floor(10000000 + Math.random() * 90000000)}` 
      : carrier === "FedEx" 
      ? `79489${Math.floor(1000000 + Math.random() * 9000000)}` 
      : `9400100000000000${Math.floor(1000 + Math.random() * 9000)}`;

    return {
      object_id: `trans_mock_${Date.now()}`,
      status: "SUCCESS",
      rate: rateId,
      tracking_number: trackingNumber,
      tracking_url_provider: `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`,
      label_url: "https://shippo-delivery-east.s3.amazonaws.com/mock-shipping-label.pdf",
      messages: []
    };
  }

  // 4. Tracking
  if (endpoint.includes("/tracks")) {
    const parts = endpoint.split("/").filter(Boolean);
    const carrier = parts[1] || "USPS";
    const trackingNumber = parts[2] || "94001000000000001234";

    return {
      carrier,
      tracking_number: trackingNumber,
      address_from: { city: "New York", state: "NY", zip: "10007", country: "US" },
      address_to: { city: "Chicago", state: "IL", zip: "60601", country: "US" },
      eta: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      tracking_status: {
        object_created: new Date().toISOString(),
        object_updated: new Date().toISOString(),
        status: "TRANSIT",
        status_details: "In transit to destination facility",
        status_date: new Date().toISOString(),
        location: { city: "Newark", state: "NJ", zip: "07101", country: "US" }
      },
      tracking_history: [
        {
          status: "TRANSIT",
          status_details: "Departed FedEx/USPS Regional Sorting Facility",
          status_date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          location: { city: "Newark", state: "NJ", zip: "07101", country: "US" }
        },
        {
          status: "PRE_TRANSIT",
          status_details: "Shipping Label Created, Carrier Awaiting Package",
          status_date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          location: { city: "New York", state: "NY", zip: "10007", country: "US" }
        }
      ]
    };
  }

  return { object_id: `shippo_mock_${Date.now()}`, status: "SUCCESS" };
}

/**
 * ─── 1. ADDRESS VALIDATION ────────────────────────────────────────────────
 * Validates shipping address with Shippo (USA, Canada, International)
 */
export async function validateAddress(addressData) {
  if (!addressData || !addressData.addressLine1 || !addressData.city || !addressData.postalCode) {
    return {
      isValid: false,
      messages: [{ text: "Street address, city, and postal code are required.", code: "MissingFields" }],
      normalizedAddress: null
    };
  }

  const payload = {
    name: addressData.fullName || addressData.name || "Customer",
    company: addressData.company || null,
    street1: addressData.addressLine1 || addressData.street1,
    street2: addressData.addressLine2 || addressData.street2 || null,
    city: addressData.city,
    state: addressData.state || null,
    zip: addressData.postalCode || addressData.zip,
    country: (addressData.countryCode || addressData.country || "US").toUpperCase(),
    phone: addressData.phone || null,
    email: addressData.email || null,
    validate: true
  };

  const res = await shippoFetch("/addresses/", {
    method: "POST",
    body: JSON.stringify(payload)
  });

  const validationResults = res.validation_results || {};
  const isValid = validationResults.is_valid !== false;

  return {
    isValid,
    validationResults,
    messages: validationResults.messages || [],
    normalizedAddress: {
      fullName: res.name || payload.name,
      company: res.company || payload.company,
      addressLine1: res.street1 || payload.street1,
      addressLine2: res.street2 || payload.street2,
      city: res.city || payload.city,
      state: res.state || payload.state,
      postalCode: res.zip || payload.zip,
      countryCode: (res.country || payload.country || "US").toUpperCase(),
      phone: res.phone || payload.phone,
      email: res.email || payload.email
    }
  };
}

/**
 * ─── 2. SHIPPING RATES ────────────────────────────────────────────────────
 * Obtains real-time carrier shipping rates for a shipment
 */
export async function getShippingRates({ addressFrom, addressTo, parcels = [] }) {
  if (!addressFrom || !addressTo || !parcels.length) {
    throw new Error("Origin address, destination address, and at least one parcel are required to fetch shipping rates.");
  }

  const payload = {
    address_from: {
      name: addressFrom.name || "Warehouse Dispatch",
      company: addressFrom.company || addressFrom.name || "Vanom Fulfilment",
      street1: addressFrom.addressLine1 || addressFrom.street1 || addressFrom.address,
      street2: addressFrom.addressLine2 || addressFrom.street2 || null,
      city: addressFrom.city,
      state: addressFrom.state,
      zip: addressFrom.postalCode || addressFrom.zip,
      country: (addressFrom.countryCode || addressFrom.country || "US").toUpperCase(),
      phone: addressFrom.phone || "+1 555-0100",
      email: addressFrom.email || null
    },
    address_to: {
      name: addressTo.fullName || addressTo.name || "Customer",
      company: addressTo.company || null,
      street1: addressTo.addressLine1 || addressTo.street1,
      street2: addressTo.addressLine2 || addressTo.street2 || null,
      city: addressTo.city,
      state: addressTo.state,
      zip: addressTo.postalCode || addressTo.zip,
      country: (addressTo.countryCode || addressTo.country || "US").toUpperCase(),
      phone: addressTo.phone || "+1 555-0199",
      email: addressTo.email || null
    },
    parcels: parcels.map((p) => ({
      length: String(p.length || 10),
      width: String(p.width || 8),
      height: String(p.height || 4),
      distance_unit: (p.dimensionUnit || p.distance_unit || "in").toLowerCase(),
      weight: String(p.weight || 1),
      mass_unit: (p.weightUnit || p.mass_unit || "lb").toLowerCase()
    })),
    async: false
  };

  const shipment = await shippoFetch("/shipments/", {
    method: "POST",
    body: JSON.stringify(payload)
  });

  const rawRates = shipment.rates || [];

  // Normalize rates cleanly for the application
  const normalizedRates = rawRates.map((rate) => ({
    id: rate.object_id,
    rateId: rate.object_id,
    carrier: rate.provider || "Standard Carrier",
    service: rate.servicelevel?.name || "Standard Shipping",
    serviceLevel: rate.servicelevel?.token || "standard",
    amount: Number(rate.amount || 0).toFixed(2),
    currency: (rate.currency || "USD").toUpperCase(),
    estimatedDays: rate.estimated_days ?? null,
    durationTerms: rate.duration_terms || null,
    carrierAccount: rate.carrier_account || null
  })).sort((a, b) => Number(a.amount) - Number(b.amount));

  return {
    shipmentId: shipment.object_id,
    rates: normalizedRates,
    messages: shipment.messages || []
  };
}

/**
 * ─── 3. CREATE SHIPMENT ───────────────────────────────────────────────────
 */
export async function createShipment({ addressFrom, addressTo, parcels = [], metadata = null }) {
  const result = await getShippingRates({ addressFrom, addressTo, parcels });
  return {
    shippoShipmentId: result.shipmentId,
    rates: result.rates,
    messages: result.messages
  };
}

/**
 * ─── 4. CREATE TRANSACTION / SHIPPING LABEL ──────────────────────────────
 * Purchases the shipping label for the chosen rate
 */
export async function createTransaction({ rateId, metadata = null }) {
  if (!rateId) throw new Error("Shippo rateId is required to generate a shipping label.");

  const payload = {
    rate: rateId,
    label_file_type: "PDF",
    async: false,
    ...(metadata ? { metadata: typeof metadata === "string" ? metadata : JSON.stringify(metadata) } : {})
  };

  const transaction = await shippoFetch("/transactions/", {
    method: "POST",
    body: JSON.stringify(payload)
  });

  if (transaction.status === "ERROR") {
    const errorMsg = transaction.messages?.map(m => m?.text || m)?.join(", ") || "Failed to create shipping label with carrier.";
    throw new Error(errorMsg);
  }

  return {
    transactionId: transaction.object_id,
    status: transaction.status,
    trackingNumber: transaction.tracking_number,
    trackingUrl: transaction.tracking_url_provider,
    labelUrl: transaction.label_url,
    commercialInvoiceUrl: transaction.commercial_invoice_url || null,
    qrCodeUrl: transaction.qr_code_url || null,
    messages: transaction.messages || []
  };
}

/**
 * ─── 5. GET SHIPMENT BY ID ────────────────────────────────────────────────
 */
export async function getShipment(shippoShipmentId) {
  if (!shippoShipmentId) throw new Error("Shippo shipment ID is required.");
  return shippoFetch(`/shipments/${shippoShipmentId}/`);
}

/**
 * ─── 6. GET TRACKING STATUS ───────────────────────────────────────────────
 */
export async function getTracking(carrier, trackingNumber) {
  if (!carrier || !trackingNumber) {
    throw new Error("Carrier name and tracking number are required to query shipment tracking.");
  }
  const cleanCarrier = carrier.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
  const cleanTracking = trackingNumber.trim();
  return shippoFetch(`/tracks/${cleanCarrier}/${cleanTracking}`);
}

/**
 * ─── 7. CREATE RETURN LABEL ───────────────────────────────────────────────
 */
export async function createReturnLabel(transactionId) {
  if (!transactionId) throw new Error("Transaction ID is required to generate a return shipping label.");
  return shippoFetch("/transactions/", {
    method: "POST",
    body: JSON.stringify({
      return_of: transactionId,
      label_file_type: "PDF",
      async: false
    })
  });
}

/**
 * ─── 8. VERIFY SHIPPO WEBHOOK ────────────────────────────────────────────
 * Validates HMAC signature for incoming Shippo webhook payloads if secret is set
 */
export function verifyShippoWebhook(rawBody, signature, secret = env.shippoWebhookSecret) {
  if (!signature || !rawBody) {
    return false;
  }
  if (!secret || secret === "shippo_whsec_placeholder") {
    if (env.nodeEnv === "production") return false;
    // In non-production test mode when secret is explicitly not set:
    return true;
  }

  try {
    const hmac = crypto.createHmac("sha256", secret);
    const digest = Buffer.from(hmac.update(rawBody).digest("hex"), "utf8");
    const sigBuffer = Buffer.from(signature, "utf8");

    if (digest.length !== sigBuffer.length) return false;
    return crypto.timingSafeEqual(digest, sigBuffer);
  } catch (err) {
    console.error("[Shippo Webhook] Verification error:", err);
    return false;
  }
}
