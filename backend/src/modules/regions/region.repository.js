// Sample repository. Replace placeholders with Prisma queries for this domain.

export async function list(query) {
  return { module: "regions", action: "list", query };
}

export async function getById(id) {
  return { module: "regions", action: "getById", id };
}

export async function create(data) {
  return { module: "regions", action: "create", data };
}

export async function update(id, data) {
  return { module: "regions", action: "update", id, data };
}

export async function remove(id) {
  return { module: "regions", action: "remove", id };
}
