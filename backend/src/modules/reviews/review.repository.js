// Sample repository. Replace placeholders with Prisma queries for this domain.

export async function list(query) {
  return { module: "reviews", action: "list", query };
}

export async function getById(id) {
  return { module: "reviews", action: "getById", id };
}

export async function create(data) {
  return { module: "reviews", action: "create", data };
}

export async function update(id, data) {
  return { module: "reviews", action: "update", id, data };
}

export async function remove(id) {
  return { module: "reviews", action: "remove", id };
}
