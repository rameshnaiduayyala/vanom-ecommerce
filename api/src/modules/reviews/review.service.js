import { prisma } from "../../config/prisma.js";
import { AppError } from "../../common/errors/app-error.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
import { MESSAGES } from "../../constants/messages.js";

const reviewInclude = {
  user: { select: { id: true, firstName: true, lastName: true, imageUrl: true } },
  product: { select: { id: true, name: true, slug: true } }
};

async function getProduct(productId) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, isActive: true }
  });
  if (!product || !product.isActive) {
    throw new AppError(MESSAGES.PRODUCT_NOT_FOUND, HTTP_STATUS.NOT_FOUND, "PRODUCT_NOT_FOUND");
  }
  return product;
}

async function ensurePurchased(productId, userId) {
  const orderItem = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: {
        userId,
        status: { in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"] }
      }
    },
    select: { id: true }
  });

  if (!orderItem) {
    throw new AppError(MESSAGES.REVIEW_PURCHASE_REQUIRED, HTTP_STATUS.FORBIDDEN, "REVIEW_PURCHASE_REQUIRED");
  }
}

function validateInput(input, { required = true } = {}) {
  if (required && input.rating === undefined) {
    throw new AppError(MESSAGES.REVIEW_RATING_INVALID, HTTP_STATUS.BAD_REQUEST, "INVALID_REVIEW_RATING");
  }
  if (input.rating !== undefined && (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5)) {
    throw new AppError(MESSAGES.REVIEW_RATING_INVALID, HTTP_STATUS.BAD_REQUEST, "INVALID_REVIEW_RATING");
  }
}

export async function createReview(productId, userId, input) {
  await getProduct(productId);
  await ensurePurchased(productId, userId);
  validateInput(input);

  try {
    return await prisma.review.create({
      data: {
        productId,
        userId,
        rating: input.rating,
        title: input.title ?? null,
        comment: input.comment ?? null,
        images: input.images ?? []
      },
      include: reviewInclude
    });
  } catch (error) {
    if (error.code === "P2002") {
      throw new AppError(MESSAGES.REVIEW_ALREADY_EXISTS, HTTP_STATUS.CONFLICT, "REVIEW_ALREADY_EXISTS");
    }
    throw error;
  }
}

export async function listReviews(productId, { page, limit, skip, rating }) {
  await getProduct(productId);
  const where = { productId, ...(rating !== undefined ? { rating } : {}) };
  const [items, total] = await prisma.$transaction([
    prisma.review.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" }, include: reviewInclude }),
    prisma.review.count({ where })
  ]);
  return { items, total };
}

export async function getReviewById(id) {
  const review = await prisma.review.findUnique({ where: { id }, include: reviewInclude });
  if (!review) throw new AppError(MESSAGES.REVIEW_NOT_FOUND, HTTP_STATUS.NOT_FOUND, "REVIEW_NOT_FOUND");
  return review;
}

async function getOwnedReview(id, userId, role) {
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) throw new AppError(MESSAGES.REVIEW_NOT_FOUND, HTTP_STATUS.NOT_FOUND, "REVIEW_NOT_FOUND");
  if (role !== "SUPERADMIN" && review.userId !== userId) {
    throw new AppError(MESSAGES.REVIEW_ACCESS_DENIED, HTTP_STATUS.FORBIDDEN, "REVIEW_ACCESS_DENIED");
  }
  return review;
}

export async function updateReview(id, userId, role, input) {
  await getOwnedReview(id, userId, role);
  validateInput(input, { required: false });
  return prisma.review.update({
    where: { id },
    data: {
      ...(input.rating !== undefined && { rating: input.rating }),
      ...(input.title !== undefined && { title: input.title }),
      ...(input.comment !== undefined && { comment: input.comment }),
      ...(input.images !== undefined && { images: input.images })
    },
    include: reviewInclude
  });
}

export async function deleteReview(id, userId, role) {
  await getOwnedReview(id, userId, role);
  return prisma.review.delete({ where: { id } });
}
