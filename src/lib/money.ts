import { Prisma } from "@prisma/client";

export const toDecimal = (value: number | string): Prisma.Decimal => {
  try {
    return new Prisma.Decimal(value);
  } catch {
    throw new Error("Invalid decimal");
  }
};

export const moneyString = (value: Prisma.Decimal | string | number): string =>
  new Prisma.Decimal(value).toFixed(2);

export const multiplyMoney = (unit: Prisma.Decimal, qty: number): Prisma.Decimal =>
  unit.mul(qty).toDecimalPlaces(2);
