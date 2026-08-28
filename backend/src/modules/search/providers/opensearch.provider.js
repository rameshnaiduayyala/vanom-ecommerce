import { SearchProvider } from "./search-provider.js";

export class OpenSearchProvider extends SearchProvider {
  async search(query) {
    // TODO: integrate OpenSearch.
    return { query, hits: [] };
  }

  async index(product) {
    return { indexed: true, id: product.id };
  }
}
