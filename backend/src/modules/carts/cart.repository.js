// Sample repository. Replace placeholders with Prisma queries for this domain.

export async function list(query) {
  return { module: "carts", action: "list", query };
}

export async function getById(id) {
  return { module: "carts", action: "getById", id };
}

export async function create(data) {
  return { module: "carts", action: "create", data };
}

export async function update(id, data) {
  return { module: "carts", action: "update", id, data };
}

export async function remove(id) {
  return { module: "carts", action: "remove", id };
}
