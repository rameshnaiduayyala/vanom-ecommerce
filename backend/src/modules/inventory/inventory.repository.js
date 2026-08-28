// Sample repository. Replace placeholders with Prisma queries for this domain.

export async function list(query) {
  return { module: "inventory", action: "list", query };
}

export async function getById(id) {
  return { module: "inventory", action: "getById", id };
}

export async function create(data) {
  return { module: "inventory", action: "create", data };
}

export async function update(id, data) {
  return { module: "inventory", action: "update", id, data };
}

export async function remove(id) {
  return { module: "inventory", action: "remove", id };
}
