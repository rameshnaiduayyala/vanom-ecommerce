// Sample repository. Replace placeholders with Prisma queries for this domain.

export async function list(query) {
  return { module: "addresses", action: "list", query };
}

export async function getById(id) {
  return { module: "addresses", action: "getById", id };
}

export async function create(data) {
  return { module: "addresses", action: "create", data };
}

export async function update(id, data) {
  return { module: "addresses", action: "update", id, data };
}

export async function remove(id) {
  return { module: "addresses", action: "remove", id };
}
