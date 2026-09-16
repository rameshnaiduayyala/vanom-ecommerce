import { prisma } from "../../config/prisma.js";
import { AppError } from "../../common/errors/app-error.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
import { MESSAGES } from "../../constants/messages.js";

function code(value) { return value.trim().toUpperCase(); }
function handleError(error) {
  if (error.code === "P2002") throw new AppError(MESSAGES.COUNTRY_CODE_EXISTS, HTTP_STATUS.CONFLICT, "COUNTRY_CODE_EXISTS");
  throw error;
}
const include = { currency: true };

export async function createCountry(input) { try { return await prisma.country.create({ data: { code: code(input.code), name: input.name, currencyId: input.currencyId }, include }); } catch (error) { handleError(error); } }
export async function listCountries({ page, limit, skip, search, currencyId }) {
  const where = { ...(currencyId ? { currencyId } : {}), ...(search ? { OR: [{ code: { contains: search, mode: "insensitive" } }, { name: { contains: search, mode: "insensitive" } }] } : {}) };
  const [items, total] = await prisma.$transaction([prisma.country.findMany({ where, skip, take: limit, orderBy: { code: "asc" }, include }), prisma.country.count({ where })]);
  return { items, total };
}
export async function getCountryById(id) { const country = await prisma.country.findUnique({ where: { id }, include }); if (!country) throw new AppError(MESSAGES.COUNTRY_NOT_FOUND, HTTP_STATUS.NOT_FOUND, "COUNTRY_NOT_FOUND"); return country; }
export async function updateCountry(id, input) { await getCountryById(id); try { return await prisma.country.update({ where: { id }, data: { ...(input.code !== undefined && { code: code(input.code) }), ...(input.name !== undefined && { name: input.name }), ...(input.currencyId !== undefined && { currencyId: input.currencyId }) }, include }); } catch (error) { handleError(error); } }
export async function deleteCountry(id) { await getCountryById(id); try { return await prisma.country.delete({ where: { id } }); } catch (error) { handleError(error); } }
