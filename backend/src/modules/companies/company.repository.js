// Sample repository. Replace placeholders with Prisma queries for this domain.

export async function list(query) {
  return { module: "companies", action: "list", query };
}

export async function getById(id) {
  return { module: "companies", action: "getById", id };
}

export async function create(data) {
  return { module: "companies", action: "create", data };
}

export async function update(id, data) {
  return { module: "companies", action: "update", id, data };
}

export async function remove(id) {
  return { module: "companies", action: "remove", id };
}
