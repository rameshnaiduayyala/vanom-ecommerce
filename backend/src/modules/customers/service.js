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

  async deleteAddress(userId, addressId) {
    const profile = await prisma.customerProfile.findUnique({ where: { userId } });
    if (!profile) return null;
    return prisma.customerAddress.deleteMany({
      where: { id: addressId, profileId: profile.id },
    });
  }
}
