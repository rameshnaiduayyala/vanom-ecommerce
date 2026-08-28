// Sample repository. Replace placeholders with Prisma queries for this domain.

export async function list(query) {
  return { module: "invoices", action: "list", query };
}

export async function getById(id) {
  return { module: "invoices", action: "getById", id };
}

export async function create(data) {
  return { module: "invoices", action: "create", data };
}

export async function update(id, data) {
  return { module: "invoices", action: "update", id, data };
}

export async function remove(id) {
  return { module: "invoices", action: "remove", id };
}
