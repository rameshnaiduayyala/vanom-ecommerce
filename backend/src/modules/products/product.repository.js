// Sample repository. Replace placeholders with Prisma queries for this domain.

export async function list(query) {
  return { module: "products", action: "list", query };
}

export async function getById(id) {
  return { module: "products", action: "getById", id };
}

export async function create(data) {
  return { module: "products", action: "create", data };
}

export async function update(id, data) {
  return { module: "products", action: "update", id, data };
}

export async function remove(id) {
  return { module: "products", action: "remove", id };
}
