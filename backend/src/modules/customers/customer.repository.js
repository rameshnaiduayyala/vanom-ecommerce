// Sample repository. Replace placeholders with Prisma queries for this domain.

export async function list(query) {
  return { module: "customers", action: "list", query };
}

export async function getById(id) {
  return { module: "customers", action: "getById", id };
}

export async function create(data) {
  return { module: "customers", action: "create", data };
}

export async function update(id, data) {
  return { module: "customers", action: "update", id, data };
}

export async function remove(id) {
  return { module: "customers", action: "remove", id };
}
