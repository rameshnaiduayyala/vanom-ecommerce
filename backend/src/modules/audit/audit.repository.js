// Sample repository. Replace placeholders with Prisma queries for this domain.

export async function list(query) {
  return { module: "audit", action: "list", query };
}

export async function getById(id) {
  return { module: "audit", action: "getById", id };
}

export async function create(data) {
  return { module: "audit", action: "create", data };
}

export async function update(id, data) {
  return { module: "audit", action: "update", id, data };
}

export async function remove(id) {
  return { module: "audit", action: "remove", id };
}
