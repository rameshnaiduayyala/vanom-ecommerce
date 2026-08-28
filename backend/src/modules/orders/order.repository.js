// Sample repository. Replace placeholders with Prisma queries for this domain.

export async function list(query) {
  return { module: "orders", action: "list", query };
}

export async function getById(id) {
  return { module: "orders", action: "getById", id };
}

export async function create(data) {
  return { module: "orders", action: "create", data };
}

export async function update(id, data) {
  return { module: "orders", action: "update", id, data };
}

export async function remove(id) {
  return { module: "orders", action: "remove", id };
}
