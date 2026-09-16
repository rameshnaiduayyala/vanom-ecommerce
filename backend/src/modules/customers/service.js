import { prisma } from "../../infrastructure/database/prisma.js";

/**
 * CustomerService
 * Direct Prisma customer address management & profile queries
 */
export class CustomerService {
  async getAddresses(userId) {
    return prisma.address.findMany({
      where: { userId },
      include: { country: true },
    });
  }

  async getAddressById(userId, addressId) {
    return prisma.address.findFirst({
      where: { id: addressId, userId },
      include: { country: true },
    });
  }

  async addAddress(userId, addressData) {
    let countryId = addressData.countryId;
    if (!countryId && addressData.countryCode) {
      const country = await prisma.country.findUnique({ where: { code: addressData.countryCode.toUpperCase() } });
      countryId = country?.id;
    }
    if (!countryId) {
      const country = await prisma.country.findFirst();
      countryId = country?.id;
    }

    if (addressData.isDefault) {
      await prisma.address.updateMany({
        where: { userId, type: addressData.type || "SHIPPING" },
        data: { isDefault: false },
      });
    }

    return prisma.address.create({
      data: {
        userId,
        type: addressData.type || "SHIPPING",
        name: addressData.name,
        line1: addressData.line1 || "",
        line2: addressData.line2,
        city: addressData.city || "",
        stateCode: addressData.stateCode || addressData.state || "NA",
        postalCode: addressData.postalCode || "",
        countryId,
        phone: addressData.phone,
        isDefault: Boolean(addressData.isDefault),
      },
      include: { country: true },
    });
  }

  async updateAddress(userId, addressId, addressData) {
    let countryId = addressData.countryId;
    if (!countryId && addressData.countryCode) {
      const country = await prisma.country.findUnique({ where: { code: addressData.countryCode.toUpperCase() } });
      countryId = country?.id;
    }

    if (addressData.isDefault) {
      await prisma.address.updateMany({
        where: { userId, type: addressData.type || "SHIPPING" },
        data: { isDefault: false },
      });
    }

    const data = {};
    if (addressData.name !== undefined) data.name = addressData.name;
    if (addressData.line1 !== undefined) data.line1 = addressData.line1;
    if (addressData.line2 !== undefined) data.line2 = addressData.line2;
    if (addressData.city !== undefined) data.city = addressData.city;
    if (addressData.stateCode !== undefined || addressData.state !== undefined) {
      data.stateCode = addressData.stateCode || addressData.state;
    }
    if (addressData.postalCode !== undefined) data.postalCode = addressData.postalCode;
    if (addressData.phone !== undefined) data.phone = addressData.phone;
    if (addressData.type !== undefined) data.type = addressData.type;
    if (addressData.isDefault !== undefined) data.isDefault = Boolean(addressData.isDefault);
    if (countryId) data.countryId = countryId;

    return prisma.address.update({
      where: { id: addressId },
      data,
      include: { country: true },
    });
  }

  async deleteAddress(userId, addressId) {
    return prisma.address.deleteMany({
      where: { id: addressId, userId },
    });
  }

  async getProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        addresses: { include: { country: true } },
      },
    });
    if (!user) return null;
    const { passwordHash, ...sanitized } = user;
    return {
      id: sanitized.id,
      userId: sanitized.id,
      user: sanitized,
      addresses: sanitized.addresses,
      marketingOptIn: sanitized.marketingOptIn,
      preferredCurrency: sanitized.preferredCurrency,
    };
  }

  async updateProfile(userId, data) {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
        ...(data.phone && { phone: data.phone }),
        ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
        ...(data.marketingOptIn !== undefined && { marketingOptIn: Boolean(data.marketingOptIn) }),
        ...(data.preferredCurrency && ["USD", "CAD"].includes(data.preferredCurrency.toUpperCase()) && { preferredCurrency: data.preferredCurrency.toUpperCase() }),
      },
      include: {
        addresses: { include: { country: true } },
      },
    });

    const { passwordHash, ...sanitized } = updated;
    return {
      id: sanitized.id,
      userId: sanitized.id,
      user: sanitized,
      addresses: sanitized.addresses,
      marketingOptIn: sanitized.marketingOptIn,
      preferredCurrency: sanitized.preferredCurrency,
    };
  }
}
