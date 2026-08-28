// Sample repository. Replace placeholders with Prisma queries for this domain.

export async function list(query) {
  return { module: "returns", action: "list", query };
}

export async function getById(id) {
  return { module: "returns", action: "getById", id };
}

export async function create(data) {
  return { module: "returns", action: "create", data };
}

export async function update(id, data) {
  return { module: "returns", action: "update", id, data };
}

export async function remove(id) {
  return { module: "returns", action: "remove", id };
}
