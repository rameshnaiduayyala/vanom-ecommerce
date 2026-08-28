// Sample repository. Replace placeholders with Prisma queries for this domain.

export async function list(query) {
  return { module: "payments", action: "list", query };
}

export async function getById(id) {
  return { module: "payments", action: "getById", id };
}

export async function create(data) {
  return { module: "payments", action: "create", data };
}

export async function update(id, data) {
  return { module: "payments", action: "update", id, data };
}

export async function remove(id) {
  return { module: "payments", action: "remove", id };
}
