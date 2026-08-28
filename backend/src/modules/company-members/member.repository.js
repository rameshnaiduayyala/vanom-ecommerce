// Sample repository. Replace placeholders with Prisma queries for this domain.

export async function list(query) {
  return { module: "company-members", action: "list", query };
}

export async function getById(id) {
  return { module: "company-members", action: "getById", id };
}

export async function create(data) {
  return { module: "company-members", action: "create", data };
}

export async function update(id, data) {
  return { module: "company-members", action: "update", id, data };
}

export async function remove(id) {
  return { module: "company-members", action: "remove", id };
}
