export class PaginationUtil {
  static parseParams(query = {}) {
    const page = Math.max(1, parseInt(query.page || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || "20", 10)));
    const skip = (page - 1) * limit;
    const sort = query.sort || "createdAt";
    const order = (query.order || "desc").toLowerCase() === "asc" ? "asc" : "desc";

    return {
      page,
      limit,
      skip,
      take: limit,
      orderBy: { [sort]: order },
      sort,
      order,
    };
  }

  static formatResult(data, total, page, limit) {
    const totalPages = Math.ceil(total / limit);
    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }
}
