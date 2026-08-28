// Sample repository. Replace placeholders with Prisma queries for this domain.

export async function list(query) {
  return { module: "wishlists", action: "list", query };
}

export async function getById(id) {
  return { module: "wishlists", action: "getById", id };
}

export async function create(data) {
  return { module: "wishlists", action: "create", data };
}

export async function update(id, data) {
  return { module: "wishlists", action: "update", id, data };
}

export async function remove(id) {
  return { module: "wishlists", action: "remove", id };
}
