// Sample repository. Replace placeholders with Prisma queries for this domain.

export async function list(query) {
  return { module: "auth", action: "list", query };
}

export async function getById(id) {
  return { module: "auth", action: "getById", id };
}

export async function create(data) {
  return { module: "auth", action: "create", data };
}

export async function update(id, data) {
  return { module: "auth", action: "update", id, data };
}

export async function remove(id) {
  return { module: "auth", action: "remove", id };
}
