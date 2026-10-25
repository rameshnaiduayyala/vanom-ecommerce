export function getPagination(query) {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);
  const cursor = query.cursor ? String(query.cursor) : null;

  return {
    page,
    limit,
    cursor,
    skip: cursor ? 1 : (page - 1) * limit
  };
}

export function getPaginationMeta(page, limit, total, nextCursor = null) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    nextCursor
  };
}
