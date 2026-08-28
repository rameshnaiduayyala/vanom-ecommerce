import crypto from "crypto";

export class IdGenerator {
  static generateOrderNumber() {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomHex = crypto.randomBytes(3).toString("hex").toUpperCase();
    return `ORD-${dateStr}-${randomHex}`;
  }

  static generateQuoteNumber() {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomHex = crypto.randomBytes(3).toString("hex").toUpperCase();
    return `QTE-${dateStr}-${randomHex}`;
  }

  static generateBulkOrderNumber() {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomHex = crypto.randomBytes(3).toString("hex").toUpperCase();
    return `BLK-${dateStr}-${randomHex}`;
  }

  static generatePONumber() {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomHex = crypto.randomBytes(3).toString("hex").toUpperCase();
    return `PO-${dateStr}-${randomHex}`;
  }

  static generateTrackingNumber(carrierCode = "STD") {
    const randomDigits = Math.floor(100000000 + Math.random() * 900000000);
    return `${carrierCode.toUpperCase()}${randomDigits}`;
  }
}
