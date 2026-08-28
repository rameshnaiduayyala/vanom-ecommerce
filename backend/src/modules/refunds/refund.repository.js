// Sample repository. Replace placeholders with Prisma queries for this domain.

export async function list(query) {
  return { module: "refunds", action: "list", query };
}

export async function getById(id) {
  return { module: "refunds", action: "getById", id };
}

export async function create(data) {
  return { module: "refunds", action: "create", data };
}

export async function update(id, data) {
  return { module: "refunds", action: "update", id, data };
}

export async function remove(id) {
  return { module: "refunds", action: "remove", id };
}
