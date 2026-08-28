// Sample repository. Replace placeholders with Prisma queries for this domain.

export async function list(query) {
  return { module: "quotes", action: "list", query };
}

export async function getById(id) {
  return { module: "quotes", action: "getById", id };
}

export async function create(data) {
  return { module: "quotes", action: "create", data };
}

export async function update(id, data) {
  return { module: "quotes", action: "update", id, data };
}

export async function remove(id) {
  return { module: "quotes", action: "remove", id };
}
