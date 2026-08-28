// Sample repository. Replace placeholders with Prisma queries for this domain.

export async function list(query) {
  return { module: "roles", action: "list", query };
}

export async function getById(id) {
  return { module: "roles", action: "getById", id };
}

export async function create(data) {
  return { module: "roles", action: "create", data };
}

export async function update(id, data) {
  return { module: "roles", action: "update", id, data };
}

export async function remove(id) {
  return { module: "roles", action: "remove", id };
}
