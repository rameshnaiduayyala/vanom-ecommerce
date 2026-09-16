import { prisma } from "../../config/prisma.js";
import { AppError } from "../../common/errors/app-error.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
import { MESSAGES } from "../../constants/messages.js";

function code(value) { return value.trim().toUpperCase(); }

function handleError(error) {
  if (error.code === "P2002") throw new AppError(MESSAGES.CURRENCY_CODE_EXISTS, HTTP_STATUS.CONFLICT, "CURRENCY_CODE_EXISTS");
  if (error.code === "P2003") throw new AppError(MESSAGES.CURRENCY_IN_USE, HTTP_STATUS.CONFLICT, "CURRENCY_IN_USE");
  throw error;
}

export async function createCurrency(input) {
  try { return await prisma.currency.create({ data: { code: code(input.code), name: input.name, symbol: input.symbol } }); }
  catch (error) { handleError(error); }
}

export async function listCurrencies({ page, limit, skip, search }) {
  const where = search ? { OR: [{ code: { contains: search, mode: "insensitive" } }, { name: { contains: search, mode: "insensitive" } }] } : {};
  const [items, total] = await prisma.$transaction([
    prisma.currency.findMany({ where, skip, take: limit, orderBy: { code: "asc" }, include: { countries: true } }),
    prisma.currency.count({ where })
  ]);
  return { items, total };
}

export async function getCurrencyById(id) {
  const currency = await prisma.currency.findUnique({ where: { id }, include: { countries: true } });
  if (!currency) throw new AppError(MESSAGES.CURRENCY_NOT_FOUND, HTTP_STATUS.NOT_FOUND, "CURRENCY_NOT_FOUND");
  return currency;
}

export async function updateCurrency(id, input) {
  await getCurrencyById(id);
  try {
    return await prisma.currency.update({ where: { id }, data: {
      ...(input.code !== undefined && { code: code(input.code) }),
      ...(input.name !== undefined && { name: input.name }),
      ...(input.symbol !== undefined && { symbol: input.symbol })
    } });
  } catch (error) { handleError(error); }
}

export async function deleteCurrency(id) {
  await getCurrencyById(id);
  try { return await prisma.currency.delete({ where: { id } }); }
  catch (error) { handleError(error); }
}
