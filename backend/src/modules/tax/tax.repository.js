// Sample repository. Replace placeholders with Prisma queries for this domain.

export async function list(query) {
  return { module: "tax", action: "list", query };
}

export async function getById(id) {
  return { module: "tax", action: "getById", id };
}

export async function create(data) {
  return { module: "tax", action: "create", data };
}

export async function update(id, data) {
  return { module: "tax", action: "update", id, data };
}

export async function remove(id) {
  return { module: "tax", action: "remove", id };
}
