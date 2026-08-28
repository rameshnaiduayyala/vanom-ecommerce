// Sample repository. Replace placeholders with Prisma queries for this domain.

export async function list(query) {
  return { module: "coupons", action: "list", query };
}

export async function getById(id) {
  return { module: "coupons", action: "getById", id };
}

export async function create(data) {
  return { module: "coupons", action: "create", data };
}

export async function update(id, data) {
  return { module: "coupons", action: "update", id, data };
}

export async function remove(id) {
  return { module: "coupons", action: "remove", id };
}
