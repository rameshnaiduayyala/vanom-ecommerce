// Sample repository. Replace placeholders with Prisma queries for this domain.

export async function list(query) {
  return { module: "brands", action: "list", query };
}

export async function getById(id) {
  return { module: "brands", action: "getById", id };
}

export async function create(data) {
  return { module: "brands", action: "create", data };
}

export async function update(id, data) {
  return { module: "brands", action: "update", id, data };
}

export async function remove(id) {
  return { module: "brands", action: "remove", id };
}
