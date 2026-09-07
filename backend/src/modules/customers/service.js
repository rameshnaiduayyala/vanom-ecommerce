import { prisma } from "../../infrastructure/database/prisma.js";

/**
 * CustomerService
 * Direct Prisma customer address management & profile queries
 */
export class CustomerService {
  async getAddresses(userId) {
    const profile = await prisma.customerProfile.findUnique({
      where: { userId },
      include: { addresses: { include: { country: true } } },
    });
    return profile?.addresses || [];
  }

  async getAddressById(userId, addressId) {
    const profile = await prisma.customerProfile.findUnique({ where: { userId } });
    if (!profile) return null;
    return prisma.customerAddress.findFirst({
      where: { id: addressId, profileId: profile.id },
      include: { country: true },
    });
  }

  async addAddress(userId, addressData) {
    let profile = await prisma.customerProfile.findUnique({ where: { userId } });
    if (!profile) {
      profile = await prisma.customerProfile.create({ data: { userId } });
    }

    let countryId = addressData.countryId;
    if (!countryId && addressData.countryCode) {
      const country = await prisma.country.findUnique({ where: { code: addressData.countryCode.toUpperCase() } });
      countryId = country?.id;
    }

    if (addressData.isDefault) {
      await prisma.customerAddress.updateMany({
        where: { profileId: profile.id, type: addressData.type || "SHIPPING" },
        data: { isDefault: false },
      });
    }

    return prisma.customerAddress.create({
      data: {
        profileId: profile.id,
        type: addressData.type || "SHIPPING",
        name: addressData.name,
        line1: addressData.line1,
        line2: addressData.line2,
        city: addressData.city,
        state: addressData.state,
        postalCode: addressData.postalCode,
        countryId,
        phone: addressData.phone,
        isDefault: Boolean(addressData.isDefault),
      },
      include: { country: true },
    });
  }

  async updateAddress(userId, addressId, addressData) {
    const profile = await prisma.customerProfile.findUnique({ where: { userId } });
    if (!profile) return null;

    let countryId = addressData.countryId;
    if (!countryId && addressData.countryCode) {
      const country = await prisma.country.findUnique({ where: { code: addressData.countryCode.toUpperCase() } });
      countryId = country?.id;
    }

    if (addressData.isDefault) {
      await prisma.customerAddress.updateMany({
        where: { profileId: profile.id, type: addressData.type || "SHIPPING" },
        data: { isDefault: false },
      });
    }

    const data = {};
    if (addressData.name !== undefined) data.name = addressData.name;
    if (addressData.line1 !== undefined) data.line1 = addressData.line1;
    if (addressData.line2 !== undefined) data.line2 = addressData.line2;
    if (addressData.city !== undefined) data.city = addressData.city;
    if (addressData.state !== undefined) data.state = addressData.state;
    if (addressData.postalCode !== undefined) data.postalCode = addressData.postalCode;
    if (addressData.phone !== undefined) data.phone = addressData.phone;
    if (addressData.type !== undefined) data.type = addressData.type;
    if (addressData.isDefault !== undefined) data.isDefault = Boolean(addressData.isDefault);
    if (countryId) data.countryId = countryId;

    return prisma.customerAddress.update({
      where: { id: addressId },
      data,
      include: { country: true },
    });
  }

  async deleteAddress(userId, addressId) {
    const profile = await prisma.customerProfile.findUnique({ where: { userId } });
    if (!profile) return null;
    return prisma.customerAddress.deleteMany({
      where: { id: addressId, profileId: profile.id },
    });
  }

  async getProfile(userId) {
    const profile = await prisma.customerProfile.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true, avatarUrl: true } },
        addresses: { include: { country: true } },
      },
    });
    return profile;
  }

  async updateProfile(userId, data) {
    if (data.firstName || data.lastName || data.phone || data.avatarUrl !== undefined) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          ...(data.firstName && { firstName: data.firstName }),
          ...(data.lastName && { lastName: data.lastName }),
          ...(data.phone && { phone: data.phone }),
          ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
        },
      });
    }

    const profile = await prisma.customerProfile.upsert({
      where: { userId },
      create: {
        userId,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        preferredLocale: data.preferredLocale,
        preferredCurrency: data.preferredCurrency,
        marketingOptIn: Boolean(data.marketingOptIn),
      },
      update: {
        ...(data.dateOfBirth && { dateOfBirth: new Date(data.dateOfBirth) }),
        ...(data.preferredLocale && { preferredLocale: data.preferredLocale }),
        ...(data.preferredCurrency && { preferredCurrency: data.preferredCurrency }),
        ...(data.marketingOptIn !== undefined && { marketingOptIn: Boolean(data.marketingOptIn) }),
      },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true, avatarUrl: true } },
      },
    });

    return profile;
  }
}
