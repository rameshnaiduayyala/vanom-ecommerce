import { GeographyRepository } from "./repository.js";
import { NotFoundError } from "../../common/errors/index.js";

export class GeographyService {
  async getCountries() {
    return GeographyRepository.listCountries();
  }

  async getCountry(identifier) {
    let country = null;
    if (identifier.length === 2) {
      country = await GeographyRepository.getCountryByCode(identifier);
    } else {
      country = await GeographyRepository.getCountryById(identifier);
    }
    if (!country) {
      throw new NotFoundError(`Country '${identifier}' not found`);
    }
    return country;
  }

  async getCurrencies() {
    return GeographyRepository.listCurrencies();
  }
}
