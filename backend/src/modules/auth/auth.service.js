import * as repository from "./auth.repository.js";

export const list = query => repository.list(query);
export const getById = id => repository.getById(id);
export const create = data => repository.create(data);
export const update = (id, data) => repository.update(id, data);
export const remove = id => repository.remove(id);
