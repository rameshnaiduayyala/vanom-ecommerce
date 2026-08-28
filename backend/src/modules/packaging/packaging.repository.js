// Sample repository. Replace placeholders with Prisma queries for this domain.

export async function list(query) {
  return { module: "packaging", action: "list", query };
}

export async function getById(id) {
  return { module: "packaging", action: "getById", id };
}

export async function create(data) {
  return { module: "packaging", action: "create", data };
}

export async function update(id, data) {
  return { module: "packaging", action: "update", id, data };
}

export async function remove(id) {
  return { module: "packaging", action: "remove", id };
}
