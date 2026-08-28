// Sample repository. Replace placeholders with Prisma queries for this domain.

export async function list(query) {
  return { module: "categories", action: "list", query };
}

export async function getById(id) {
  return { module: "categories", action: "getById", id };
}

export async function create(data) {
  return { module: "categories", action: "create", data };
}

export async function update(id, data) {
  return { module: "categories", action: "update", id, data };
}

export async function remove(id) {
  return { module: "categories", action: "remove", id };
}
