// Sample repository. Replace placeholders with Prisma queries for this domain.

export async function list(query) {
  return { module: "notifications", action: "list", query };
}

export async function getById(id) {
  return { module: "notifications", action: "getById", id };
}

export async function create(data) {
  return { module: "notifications", action: "create", data };
}

export async function update(id, data) {
  return { module: "notifications", action: "update", id, data };
}

export async function remove(id) {
  return { module: "notifications", action: "remove", id };
}
