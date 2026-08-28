import { DefaultTaxProvider } from "./providers/index.js";
import { GeographyRepository } from "../geography/repository.js";
import { NotFoundError } from "../../common/errors/index.js";

export class TaxService {
  constructor(taxProvider = new DefaultTaxProvider()) {
    this.taxProvider = taxProvider;
  }

  async calculateTax({ countryCode = "IN", regionCode = null, items = [], customerType = "B2C", isB2BApproved = false }) {
    const country = await GeographyRepository.getCountryByCode(countryCode);
    if (!country) {
      throw new NotFoundError(`Country '${countryCode}' not found`);
    }

    return this.taxProvider.calculateTax({
      countryCode,
      regionCode,
      items,
      customerType,
      isB2BApproved,
    });
  }
}
