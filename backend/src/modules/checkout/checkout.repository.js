// Sample repository. Replace placeholders with Prisma queries for this domain.

export async function list(query) {
  return { module: "checkout", action: "list", query };
}

export async function getById(id) {
  return { module: "checkout", action: "getById", id };
}

export async function create(data) {
  return { module: "checkout", action: "create", data };
}

export async function update(id, data) {
  return { module: "checkout", action: "update", id, data };
}

export async function remove(id) {
  return { module: "checkout", action: "remove", id };
}
