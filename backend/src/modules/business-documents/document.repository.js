// Sample repository. Replace placeholders with Prisma queries for this domain.

export async function list(query) {
  return { module: "business-documents", action: "list", query };
}

export async function getById(id) {
  return { module: "business-documents", action: "getById", id };
}

export async function create(data) {
  return { module: "business-documents", action: "create", data };
}

export async function update(id, data) {
  return { module: "business-documents", action: "update", id, data };
}

export async function remove(id) {
  return { module: "business-documents", action: "remove", id };
}
