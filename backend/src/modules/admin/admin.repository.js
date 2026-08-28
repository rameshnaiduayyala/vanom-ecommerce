// Sample repository. Replace placeholders with Prisma queries for this domain.

export async function list(query) {
  return { module: "admin", action: "list", query };
}

export async function getById(id) {
  return { module: "admin", action: "getById", id };
}

export async function create(data) {
  return { module: "admin", action: "create", data };
}

export async function update(id, data) {
  return { module: "admin", action: "update", id, data };
}

export async function remove(id) {
  return { module: "admin", action: "remove", id };
}
