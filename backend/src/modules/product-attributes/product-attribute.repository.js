// Sample repository. Replace placeholders with Prisma queries for this domain.

export async function list(query) {
  return { module: "product-attributes", action: "list", query };
}

export async function getById(id) {
  return { module: "product-attributes", action: "getById", id };
}

export async function create(data) {
  return { module: "product-attributes", action: "create", data };
}

export async function update(id, data) {
  return { module: "product-attributes", action: "update", id, data };
}

export async function remove(id) {
  return { module: "product-attributes", action: "remove", id };
}
