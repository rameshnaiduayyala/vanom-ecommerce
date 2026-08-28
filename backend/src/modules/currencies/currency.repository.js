// Sample repository. Replace placeholders with Prisma queries for this domain.

export async function list(query) {
  return { module: "currencies", action: "list", query };
}

export async function getById(id) {
  return { module: "currencies", action: "getById", id };
}

export async function create(data) {
  return { module: "currencies", action: "create", data };
}

export async function update(id, data) {
  return { module: "currencies", action: "update", id, data };
}

export async function remove(id) {
  return { module: "currencies", action: "remove", id };
}
