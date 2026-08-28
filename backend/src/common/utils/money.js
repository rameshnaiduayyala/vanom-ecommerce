import { Prisma } from "@prisma/client";

/**
 * Enterprise Financial Precision Arithmetic using Prisma.Decimal
 * Zero JavaScript floating point errors.
 */
export class Money {
  static toDecimal(value) {
    if (value === null || value === undefined) {
      return new Prisma.Decimal(0);
    }
    if (value instanceof Prisma.Decimal) {
      return value;
    }
    return new Prisma.Decimal(value.toString());
  }

  static add(a, b) {
    return Money.toDecimal(a).add(Money.toDecimal(b));
  }

  static subtract(a, b) {
    return Money.toDecimal(a).sub(Money.toDecimal(b));
  }

  static multiply(a, b) {
    return Money.toDecimal(a).mul(Money.toDecimal(b));
  }

  static divide(a, b) {
    const divisor = Money.toDecimal(b);
    if (divisor.isZero()) {
      throw new Error("Division by zero in financial calculation");
    }
    return Money.toDecimal(a).div(divisor);
  }

  static round(value, decimals = 2) {
    return Money.toDecimal(value).toDecimalPlaces(decimals, Prisma.Decimal.ROUND_HALF_UP);
  }

  static percentage(amount, percent) {
    const decAmount = Money.toDecimal(amount);
    const decPercent = Money.toDecimal(percent);
    return decAmount.mul(decPercent).div(new Prisma.Decimal(100));
  }

  static isGreaterThan(a, b) {
    return Money.toDecimal(a).greaterThan(Money.toDecimal(b));
  }

  static isGreaterThanOrEqual(a, b) {
    return Money.toDecimal(a).greaterThanOrEqualTo(Money.toDecimal(b));
  }

  static isLessThan(a, b) {
    return Money.toDecimal(a).lessThan(Money.toDecimal(b));
  }

  static isLessThanOrEqual(a, b) {
    return Money.toDecimal(a).lessThanOrEqualTo(Money.toDecimal(b));
  }

  static isEqual(a, b) {
    return Money.toDecimal(a).equals(Money.toDecimal(b));
  }

  static isZero(a) {
    return Money.toDecimal(a).isZero();
  }

  static isPositive(a) {
    return Money.toDecimal(a).isPositive() && !Money.toDecimal(a).isZero();
  }

  static format(value, decimals = 2) {
    return Money.round(value, decimals).toFixed(decimals);
  }
}
