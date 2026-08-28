// Sample repository. Replace placeholders with Prisma queries for this domain.

export async function list(query) {
  return { module: "customer-groups", action: "list", query };
}

export async function getById(id) {
  return { module: "customer-groups", action: "getById", id };
}

export async function create(data) {
  return { module: "customer-groups", action: "create", data };
}

export async function update(id, data) {
  return { module: "customer-groups", action: "update", id, data };
}

export async function remove(id) {
  return { module: "customer-groups", action: "remove", id };
}
