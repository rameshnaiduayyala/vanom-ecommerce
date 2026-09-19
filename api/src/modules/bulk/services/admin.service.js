import { prisma } from "../../../config/prisma.js";
import { getPagination } from "../../../common/utils/pagination.js";
import { fail, orderInclude } from "./bulk.helper.js";
import * as orderService from "./order.service.js";

export async function listBusinesses(query = {}) {
  const { page, limit, skip } = getPagination(query);
  const where = {
    ...(query.status ? { status: query.status } : {}),
    ...(query.search ? {
      OR: [
        { businessName: { contains: query.search, mode: "insensitive" } },
        { businessEmail: { contains: query.search, mode: "insensitive" } }
      ]
    } : {}),
    ...(query.countryCode ? { countryCode: query.countryCode } : {}),
    ...(query.from || query.to ? {
      createdAt: {
        ...(query.from ? { gte: new Date(query.from) } : {}),
        ...(query.to ? { lte: new Date(query.to) } : {})
      }
    } : {})
  };

  const [items, total] = await prisma.$transaction([
    prisma.bulkBusiness.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { users: true, addresses: true }
    }),
    prisma.bulkBusiness.count({ where })
  ]);

  return { items, total, page, limit };
}

export async function getBusiness(id) {
  const item = await prisma.bulkBusiness.findUnique({
    where: { id },
    include: { users: true, addresses: true }
  });
  return item ?? fail("Bulk business not found");
}

export async function createBusiness(input, userId) {
  const data = { ...input, businessEmail: input.businessEmail.trim().toLowerCase() };
  const business = await prisma.bulkBusiness.create({ data });
  if (userId) {
    await prisma.user.update({
      where: { id: userId },
      data: { bulkBusinessId: business.id }
    });
  }
  return business;
}

export async function updateBusiness(id, input) {
  await getBusiness(id);
  return prisma.bulkBusiness.update({
    where: { id },
    data: {
      ...(input.businessName && { businessName: input.businessName }),
      ...(input.businessEmail && { businessEmail: input.businessEmail.trim().toLowerCase() }),
      ...(input.businessPhone && { businessPhone: input.businessPhone }),
      ...(input.taxRegistrationNumber !== undefined && { taxRegistrationNumber: input.taxRegistrationNumber }),
      ...(input.registrationNumber !== undefined && { registrationNumber: input.registrationNumber }),
      ...(input.countryCode && { countryCode: input.countryCode.toUpperCase() }),
      ...(input.address && { address: input.address }),
      ...(input.contactPersonName && { contactPersonName: input.contactPersonName }),
      ...(input.status && { status: input.status })
    },
    include: { users: true, addresses: true }
  });
}

export async function deleteBusiness(id) {
  await getBusiness(id);
  return prisma.bulkBusiness.delete({ where: { id } });
}

export async function changeBusinessStatus(id, status, approvedBy, rejectionReason) {
  await getBusiness(id);
  const updatedBusiness = await prisma.bulkBusiness.update({
    where: { id },
    data: {
      status,
      approvedBy: status === "APPROVED" ? approvedBy : null,
      approvedAt: status === "APPROVED" ? new Date() : null,
      rejectionReason: status === "REJECTED" ? rejectionReason : null
    },
    include: { users: true, addresses: true }
  });

  if (status === "APPROVED") {
    await prisma.user.updateMany({
      where: { bulkBusinessId: id, role: { not: "SUPERADMIN" } },
      data: { role: "B2B_USER" }
    });
  } else if (status === "REJECTED" || status === "SUSPENDED") {
    await prisma.user.updateMany({
      where: { bulkBusinessId: id, role: { not: "SUPERADMIN" } },
      data: { role: "USER" }
    });
  }

  return updatedBusiness;
}

export const approveBusiness = (id, adminId) => changeBusinessStatus(id, "APPROVED", adminId);
export const rejectBusiness = (id, adminId, reason) => changeBusinessStatus(id, "REJECTED", adminId, reason);
export const suspendBusiness = (id, adminId) => changeBusinessStatus(id, "SUSPENDED", adminId);

export const listOrders = (adminId, query) => orderService.list(adminId, query, true);
export const getOrder = (adminId, id) => orderService.getById(adminId, id, true);

export async function updateOrderStatus(id, input) {
  await getOrder(null, id);
  return prisma.bulkOrder.update({
    where: { id },
    data: {
      ...(input.status ? { status: input.status } : {}),
      ...(input.paymentStatus ? { paymentStatus: input.paymentStatus } : {}),
      ...(input.shippingStatus ? { shippingStatus: input.shippingStatus } : {})
    },
    include: orderInclude
  });
}
