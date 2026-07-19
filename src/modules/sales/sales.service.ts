import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { badRequest, conflict, notFound } from "@/lib/errors";
import { moneyString, multiplyMoney, toDecimal } from "@/lib/money";

const lineSelect = {
  id: true,
  productId: true,
  quantity: true,
  unitPrice: true,
  lineTotal: true,
  product: { select: { id: true, name: true, sku: true } },
} satisfies Prisma.SaleLineSelect;

const saleSelect = {
  id: true,
  total: true,
  soldAt: true,
  createdAt: true,
  updatedAt: true,
  lines: { select: lineSelect },
} satisfies Prisma.SaleSelect;

type SaleRow = Prisma.SaleGetPayload<{ select: typeof saleSelect }>;

const serialize = (s: SaleRow) => ({
  id: s.id,
  total: moneyString(s.total),
  soldAt: s.soldAt,
  createdAt: s.createdAt,
  updatedAt: s.updatedAt,
  lines: s.lines.map((l) => ({
    id: l.id,
    productId: l.productId,
    quantity: l.quantity,
    unitPrice: moneyString(l.unitPrice),
    lineTotal: moneyString(l.lineTotal),
    product: l.product,
  })),
});

export type SaleLineInput = {
  productId: string;
  quantity: number;
  unitPrice: number | string;
};

export type CreateSaleInput = {
  soldAt?: string | Date;
  lines: SaleLineInput[];
};

const parseLines = (lines: SaleLineInput[]) => {
  if (!Array.isArray(lines) || lines.length === 0) {
    throw badRequest("lines must be a non-empty array");
  }

  return lines.map((line, i) => {
    if (!line?.productId) throw badRequest(`lines[${i}].productId is required`);
    if (!Number.isInteger(line.quantity) || line.quantity <= 0) {
      throw badRequest(`lines[${i}].quantity must be a positive integer`);
    }
    let unitPrice: Prisma.Decimal;
    try {
      unitPrice = toDecimal(line.unitPrice);
    } catch {
      throw badRequest(`lines[${i}].unitPrice is invalid`);
    }
    if (unitPrice.lt(0)) throw badRequest(`lines[${i}].unitPrice must be >= 0`);
    return {
      productId: line.productId,
      quantity: line.quantity,
      unitPrice,
      lineTotal: multiplyMoney(unitPrice, line.quantity),
    };
  });
};

export const listSales = async () => {
  const rows = await prisma.sale.findMany({
    select: saleSelect,
    orderBy: { soldAt: "desc" },
  });
  return rows.map(serialize);
};

export const getSale = async (id: string) => {
  const row = await prisma.sale.findUnique({
    where: { id },
    select: saleSelect,
  });
  if (!row) throw notFound("Sale not found");
  return serialize(row);
};

export const createSale = async (input: CreateSaleInput) => {
  const lines = parseLines(input.lines);
  const productIds = [...new Set(lines.map((l) => l.productId))];

  const soldAt = input.soldAt ? new Date(input.soldAt) : new Date();
  if (Number.isNaN(soldAt.getTime())) throw badRequest("soldAt is invalid");

  const total = lines.reduce(
    (sum, l) => sum.add(l.lineTotal),
    new Prisma.Decimal(0),
  );

  const qtyByProduct = new Map<string, number>();
  for (const l of lines) {
    qtyByProduct.set(l.productId, (qtyByProduct.get(l.productId) ?? 0) + l.quantity);
  }

  const sale = await prisma.$transaction(async (tx) => {
    const products = await tx.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, stock: true, name: true },
    });
    if (products.length !== productIds.length) {
      throw badRequest("One or more products not found");
    }

    for (const product of products) {
      const need = qtyByProduct.get(product.id) ?? 0;
      if (product.stock < need) {
        throw conflict(
          `Insufficient stock for "${product.name}" (have ${product.stock}, need ${need})`,
          "INSUFFICIENT_STOCK",
        );
      }
    }

    const created = await tx.sale.create({
      data: {
        total,
        soldAt,
        lines: {
          create: lines.map((l) => ({
            productId: l.productId,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
            lineTotal: l.lineTotal,
          })),
        },
      },
      select: saleSelect,
    });

    await Promise.all(
      [...qtyByProduct.entries()].map(([productId, quantity]) =>
        tx.product.update({
          where: { id: productId },
          data: { stock: { decrement: quantity } },
        }),
      ),
    );

    return created;
  });

  return serialize(sale);
};

export const deleteSale = async (id: string) => {
  await prisma.$transaction(async (tx) => {
    const sale = await tx.sale.findUnique({
      where: { id },
      select: {
        id: true,
        lines: { select: { productId: true, quantity: true } },
      },
    });
    if (!sale) throw notFound("Sale not found");

    const qtyByProduct = new Map<string, number>();
    for (const l of sale.lines) {
      qtyByProduct.set(l.productId, (qtyByProduct.get(l.productId) ?? 0) + l.quantity);
    }

    await Promise.all(
      [...qtyByProduct.entries()].map(([productId, quantity]) =>
        tx.product.update({
          where: { id: productId },
          data: { stock: { increment: quantity } },
        }),
      ),
    );

    await tx.sale.delete({ where: { id } });
  });
};
