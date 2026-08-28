// Sample repository. Replace placeholders with Prisma queries for this domain.

export async function list(query) {
  return { module: "reports", action: "list", query };
}

export async function getById(id) {
  return { module: "reports", action: "getById", id };
}

export async function create(data) {
  return { module: "reports", action: "create", data };
}

export async function update(id, data) {
  return { module: "reports", action: "update", id, data };
}

export async function remove(id) {
  return { module: "reports", action: "remove", id };
}
