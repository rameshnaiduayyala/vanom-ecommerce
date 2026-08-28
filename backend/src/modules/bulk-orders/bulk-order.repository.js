// Sample repository. Replace placeholders with Prisma queries for this domain.

export async function list(query) {
  return { module: "bulk-orders", action: "list", query };
}

export async function getById(id) {
  return { module: "bulk-orders", action: "getById", id };
}

export async function create(data) {
  return { module: "bulk-orders", action: "create", data };
}

export async function update(id, data) {
  return { module: "bulk-orders", action: "update", id, data };
}

export async function remove(id) {
  return { module: "bulk-orders", action: "remove", id };
}
