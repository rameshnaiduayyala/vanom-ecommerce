// Sample repository. Replace placeholders with Prisma queries for this domain.

export async function list(query) {
  return { module: "permissions", action: "list", query };
}

export async function getById(id) {
  return { module: "permissions", action: "getById", id };
}

export async function create(data) {
  return { module: "permissions", action: "create", data };
}

export async function update(id, data) {
  return { module: "permissions", action: "update", id, data };
}

export async function remove(id) {
  return { module: "permissions", action: "remove", id };
}
