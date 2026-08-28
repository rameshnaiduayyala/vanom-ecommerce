import { prisma } from "../../infrastructure/database/prisma.js";
import { GeographyRepository } from "../geography/repository.js";
import { NotFoundError } from "../../common/errors/index.js";

export class CustomerRepository {
  static async getAddresses(userId) {
    const profile = await prisma.customerProfile.findUnique({
      where: { userId },
      include: { addresses: { include: { country: true } } },
    });
    return profile?.addresses || [];
  }

  static async addAddress(userId, addressData) {
    let profile = await prisma.customerProfile.findUnique({ where: { userId } });
    if (!profile) {
      profile = await prisma.customerProfile.create({ data: { userId } });
    }

    let countryId = addressData.countryId;
    if (!countryId && addressData.countryCode) {
      const country = await GeographyRepository.getCountryByCode(addressData.countryCode);
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

  static async deleteAddress(userId, addressId) {
    const profile = await prisma.customerProfile.findUnique({ where: { userId } });
    if (!profile) return null;
    return prisma.customerAddress.deleteMany({
      where: { id: addressId, profileId: profile.id },
    });
  }
}

export default async function customerRoutes(fastify, options) {
  fastify.get("/customers/addresses", {
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      const data = await CustomerRepository.getAddresses(request.user.id);
      return reply.send({ success: true, data });
    },
  });

  fastify.post("/customers/addresses", {
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      const data = await CustomerRepository.addAddress(request.user.id, request.body);
      return reply.status(201).send({ success: true, data });
    },
  });

  fastify.delete("/customers/addresses/:id", {
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      await CustomerRepository.deleteAddress(request.user.id, request.params.id);
      return reply.send({ success: true, message: "Address deleted" });
    },
  });
}
