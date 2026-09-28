import { prisma } from "../../config/prisma.js";
import { AppError } from "../../common/errors/app-error.js";
import { HTTP_STATUS } from "../../constants/http-status.js";

export async function getOrCreateDefaultWarehouse(organizationId, tx = prisma) {
  let warehouse = await tx.warehouse.findFirst({
    where: { organizationId, isActive: true },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }]
  });

  if (!warehouse) {
    warehouse = await tx.warehouse.create({
      data: {
        organizationId,
        name: "Central Logistics Depot",
        code: "DEPOT-01",
        address: "100 World Trade Center Blvd",
        city: "New York",
        state: "NY",
        country: "USA",
        postalCode: "10007",
        isDefault: true,
        isActive: true
      }
    });
  }

  return warehouse;
}

export async function listWarehouses(organizationId, { isActive, search } = {}) {
  const where = {
    organizationId,
    ...(isActive !== undefined ? { isActive } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { code: { contains: search, mode: "insensitive" } },
            { city: { contains: search, mode: "insensitive" } }
          ]
        }
      : {})
  };

  const warehouses = await prisma.warehouse.findMany({
    where,
    include: {
      _count: {
        select: { inventories: true }
      }
    },
    orderBy: [{ isDefault: "desc" }, { name: "asc" }]
  });

  return warehouses;
}

export async function getWarehouseById(organizationId, id) {
  const warehouse = await prisma.warehouse.findFirst({
    where: { id, organizationId },
    include: {
      _count: {
        select: { inventories: true }
      }
    }
  });

  if (!warehouse) {
    throw new AppError("Warehouse not found", HTTP_STATUS.NOT_FOUND, "WAREHOUSE_NOT_FOUND");
  }

  return warehouse;
}

export async function createWarehouse(organizationId, data) {
  const code = (data.code || "").trim().toUpperCase();
  if (!code) {
    throw new AppError("Warehouse code is required", HTTP_STATUS.BAD_REQUEST, "INVALID_WAREHOUSE_CODE");
  }

  const existing = await prisma.warehouse.findUnique({
    where: {
      organizationId_code: {
        organizationId,
        code
      }
    }
  });

  if (existing) {
    throw new AppError(`Warehouse code ${code} already exists for this organization`, HTTP_STATUS.CONFLICT, "DUPLICATE_WAREHOUSE_CODE");
  }

  if (data.isDefault) {
    await prisma.warehouse.updateMany({
      where: { organizationId, isDefault: true },
      data: { isDefault: false }
    });
  }

  return prisma.warehouse.create({
    data: {
      organizationId,
      name: data.name,
      code,
      address: data.address || null,
      city: data.city || null,
      state: data.state || null,
      country: data.country || null,
      postalCode: data.postalCode || null,
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      isDefault: Boolean(data.isDefault)
    }
  });
}

export async function updateWarehouse(organizationId, id, data) {
  const warehouse = await getWarehouseById(organizationId, id);

  if (data.code) {
    const code = data.code.trim().toUpperCase();
    if (code !== warehouse.code) {
      const conflict = await prisma.warehouse.findUnique({
        where: { organizationId_code: { organizationId, code } }
      });
      if (conflict) {
        throw new AppError(`Warehouse code ${code} already in use`, HTTP_STATUS.CONFLICT, "DUPLICATE_WAREHOUSE_CODE");
      }
    }
  }

  if (data.isDefault) {
    await prisma.warehouse.updateMany({
      where: { organizationId, isDefault: true, id: { not: id } },
      data: { isDefault: false }
    });
  }

  return prisma.warehouse.update({
    where: { id },
    data: {
      ...(data.name ? { name: data.name } : {}),
      ...(data.code ? { code: data.code.trim().toUpperCase() } : {}),
      ...(data.address !== undefined ? { address: data.address } : {}),
      ...(data.city !== undefined ? { city: data.city } : {}),
      ...(data.state !== undefined ? { state: data.state } : {}),
      ...(data.country !== undefined ? { country: data.country } : {}),
      ...(data.postalCode !== undefined ? { postalCode: data.postalCode } : {}),
      ...(data.isActive !== undefined ? { isActive: Boolean(data.isActive) } : {}),
      ...(data.isDefault !== undefined ? { isDefault: Boolean(data.isDefault) } : {})
    }
  });
}

export async function deleteWarehouse(organizationId, id) {
  const warehouse = await getWarehouseById(organizationId, id);

  // Check if warehouse contains inventory with stock
  const stockCount = await prisma.inventory.aggregate({
    where: { warehouseId: id, quantity: { gt: 0 } },
    _sum: { quantity: true }
  });

  if ((stockCount._sum.quantity || 0) > 0) {
    throw new AppError(
      "Cannot delete warehouse with active non-zero inventory. Transfer or adjust stock first.",
      HTTP_STATUS.BAD_REQUEST,
      "WAREHOUSE_HAS_STOCK"
    );
  }

  return prisma.warehouse.delete({ where: { id: warehouse.id } });
}
