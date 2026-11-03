import { apiClient } from "./axios.js";

/**
 * Dedicated Search Service
 * Handles live search autocomplete and catalog querying
 */
export const searchService = {
  /**
   * Search products, brands, and categories
   * @param {Object} params - { q, categoryId, limit, country }
   * @param {Object} options - axios options (e.g. { signal })
   */
  searchCatalog: async (params = {}, options = {}) => {
    return apiClient.get("/products/search", {
      params,
      silent: true,
      ...options,
    });
  },

  /**
   * Helper alias for search queries
   */
  searchProducts: async (query, countryCode = "US", categoryId = null, limit = 8, options = {}) => {
    return searchService.searchCatalog(
      {
        q: query,
        country: countryCode,
        ...(categoryId ? { categoryId } : {}),
        limit,
      },
      options
    );
  },
};

export default searchService;

