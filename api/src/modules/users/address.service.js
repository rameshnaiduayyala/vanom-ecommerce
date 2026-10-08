import { prisma } from "../../config/prisma.js";
import { AppError } from "../../common/errors/app-error.js";
import { HTTP_STATUS } from "../../constants/http-status.js";

export async function listAddresses(userId) {
  return prisma.userAddress.findMany({
    where: { userId },
    orderBy: [
      { isDefault: "desc" },
      { createdAt: "desc" }
    ]
  });
}

export async function getAddressById(userId, addressId) {
  const address = await prisma.userAddress.findFirst({
    where: { id: addressId, userId }
  });
  if (!address) {
    throw new AppError("Address not found", HTTP_STATUS.NOT_FOUND, "ADDRESS_NOT_FOUND");
  }
  return address;
}

export async function createAddress(userId, data) {
  const existingCount = await prisma.userAddress.count({ where: { userId } });
  const shouldBeDefault = existingCount === 0 || Boolean(data.isDefault);

  return prisma.$transaction(async (tx) => {
    if (shouldBeDefault) {
      await tx.userAddress.updateMany({
        where: { userId },
        data: { isDefault: false }
      });
    }

    return tx.userAddress.create({
      data: {
        userId,
        name: data.name?.trim() || null,
        fullName: data.fullName?.trim(),
        phone: data.phone?.trim(),
        addressLine1: data.addressLine1?.trim(),
        addressLine2: data.addressLine2?.trim() || null,
        city: data.city?.trim(),
        state: data.state?.trim() || null,
        postalCode: data.postalCode?.trim(),
        countryCode: (data.countryCode || "US").trim().toUpperCase(),
        isDefault: shouldBeDefault
      }
    });
  });
}

export async function updateAddress(userId, addressId, data) {
  await getAddressById(userId, addressId);

  return prisma.$transaction(async (tx) => {
    if (data.isDefault) {
      await tx.userAddress.updateMany({
        where: { userId, NOT: { id: addressId } },
        data: { isDefault: false }
      });
    }

    return tx.userAddress.update({
      where: { id: addressId },
      data: {
        ...(data.name !== undefined && { name: data.name?.trim() || null }),
        ...(data.fullName !== undefined && { fullName: data.fullName.trim() }),
        ...(data.phone !== undefined && { phone: data.phone.trim() }),
        ...(data.addressLine1 !== undefined && { addressLine1: data.addressLine1.trim() }),
        ...(data.addressLine2 !== undefined && { addressLine2: data.addressLine2?.trim() || null }),
        ...(data.city !== undefined && { city: data.city.trim() }),
        ...(data.state !== undefined && { state: data.state?.trim() || null }),
        ...(data.postalCode !== undefined && { postalCode: data.postalCode.trim() }),
        ...(data.countryCode !== undefined && { countryCode: data.countryCode.trim().toUpperCase() }),
        ...(data.isDefault !== undefined && { isDefault: Boolean(data.isDefault) })
      }
    });
  });
}

export async function deleteAddress(userId, addressId) {
  const address = await getAddressById(userId, addressId);

  return prisma.$transaction(async (tx) => {
    await tx.userAddress.delete({ where: { id: addressId } });

    // If the deleted address was the default, assign the next newest address as default
    if (address.isDefault) {
      const nextAddress = await tx.userAddress.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" }
      });
      if (nextAddress) {
        await tx.userAddress.update({
          where: { id: nextAddress.id },
          data: { isDefault: true }
        });
      }
    }

    return { deleted: true };
  });
}

export async function setDefaultAddress(userId, addressId) {
  await getAddressById(userId, addressId);

  return prisma.$transaction(async (tx) => {
    await tx.userAddress.updateMany({
      where: { userId },
      data: { isDefault: false }
    });

    return tx.userAddress.update({
      where: { id: addressId },
      data: { isDefault: true }
    });
  });
}
