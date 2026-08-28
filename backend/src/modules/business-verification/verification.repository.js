// Sample repository. Replace placeholders with Prisma queries for this domain.

export async function list(query) {
  return { module: "business-verification", action: "list", query };
}

export async function getById(id) {
  return { module: "business-verification", action: "getById", id };
}

export async function create(data) {
  return { module: "business-verification", action: "create", data };
}

export async function update(id, data) {
  return { module: "business-verification", action: "update", id, data };
}

export async function remove(id) {
  return { module: "business-verification", action: "remove", id };
}
