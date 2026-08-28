// Sample repository. Replace placeholders with Prisma queries for this domain.

export async function list(query) {
  return { module: "shipping", action: "list", query };
}

export async function getById(id) {
  return { module: "shipping", action: "getById", id };
}

export async function create(data) {
  return { module: "shipping", action: "create", data };
}

export async function update(id, data) {
  return { module: "shipping", action: "update", id, data };
}

export async function remove(id) {
  return { module: "shipping", action: "remove", id };
}
