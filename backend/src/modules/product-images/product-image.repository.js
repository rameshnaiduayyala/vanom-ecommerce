// Sample repository. Replace placeholders with Prisma queries for this domain.

export async function list(query) {
  return { module: "product-images", action: "list", query };
}

export async function getById(id) {
  return { module: "product-images", action: "getById", id };
}

export async function create(data) {
  return { module: "product-images", action: "create", data };
}

export async function update(id, data) {
  return { module: "product-images", action: "update", id, data };
}

export async function remove(id) {
  return { module: "product-images", action: "remove", id };
}
