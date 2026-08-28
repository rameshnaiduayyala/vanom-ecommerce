// Sample repository. Replace placeholders with Prisma queries for this domain.

export async function list(query) {
  return { module: "users", action: "list", query };
}

export async function getById(id) {
  return { module: "users", action: "getById", id };
}

export async function create(data) {
  return { module: "users", action: "create", data };
}

export async function update(id, data) {
  return { module: "users", action: "update", id, data };
}

export async function remove(id) {
  return { module: "users", action: "remove", id };
}
