import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { badRequest, notFound } from "@/lib/errors";
import { moneyString, multiplyMoney, toDecimal } from "@/lib/money";

const lineSelect = {
  id: true,
  productId: true,
  quantity: true,
  unitCost: true,
  lineTotal: true,
  product: { select: { id: true, name: true, sku: true } },
} satisfies Prisma.PurchaseLineSelect;

const purchaseSelect = {
  id: true,
  total: true,
  purchasedAt: true,
  createdAt: true,
  updatedAt: true,
  lines: { select: lineSelect },
} satisfies Prisma.PurchaseSelect;

type PurchaseRow = Prisma.PurchaseGetPayload<{ select: typeof purchaseSelect }>;

const serialize = (p: PurchaseRow) => ({
  id: p.id,
  total: moneyString(p.total),
  purchasedAt: p.purchasedAt,
  createdAt: p.createdAt,
  updatedAt: p.updatedAt,
  lines: p.lines.map((l) => ({
    id: l.id,
    productId: l.productId,
    quantity: l.quantity,
    unitCost: moneyString(l.unitCost),
    lineTotal: moneyString(l.lineTotal),
    product: l.product,
  })),
});

export type PurchaseLineInput = {
  productId: string;
  quantity: number;
  unitCost: number | string;
};

export type CreatePurchaseInput = {
  purchasedAt?: string | Date;
  lines: PurchaseLineInput[];
};

const parseLines = (lines: PurchaseLineInput[]) => {
  if (!Array.isArray(lines) || lines.length === 0) {
    throw badRequest("lines must be a non-empty array");
  }

  return lines.map((line, i) => {
    if (!line?.productId) throw badRequest(`lines[${i}].productId is required`);
    if (!Number.isInteger(line.quantity) || line.quantity <= 0) {
      throw badRequest(`lines[${i}].quantity must be a positive integer`);
    }
    let unitCost: Prisma.Decimal;
    try {
      unitCost = toDecimal(line.unitCost);
    } catch {
      throw badRequest(`lines[${i}].unitCost is invalid`);
    }
    if (unitCost.lt(0)) throw badRequest(`lines[${i}].unitCost must be >= 0`);
    return {
      productId: line.productId,
      quantity: line.quantity,
      unitCost,
      lineTotal: multiplyMoney(unitCost, line.quantity),
    };
  });
};

export const listPurchases = async () => {
  const rows = await prisma.purchase.findMany({
    select: purchaseSelect,
    orderBy: { purchasedAt: "desc" },
  });
  return rows.map(serialize);
};

export const getPurchase = async (id: string) => {
  const row = await prisma.purchase.findUnique({
    where: { id },
    select: purchaseSelect,
  });
  if (!row) throw notFound("Purchase not found");
  return serialize(row);
};

export const createPurchase = async (input: CreatePurchaseInput) => {
  const lines = parseLines(input.lines);
  const productIds = [...new Set(lines.map((l) => l.productId))];

  const purchasedAt = input.purchasedAt ? new Date(input.purchasedAt) : new Date();
  if (Number.isNaN(purchasedAt.getTime())) throw badRequest("purchasedAt is invalid");

  const total = lines.reduce(
    (sum, l) => sum.add(l.lineTotal),
    new Prisma.Decimal(0),
  );

  const purchase = await prisma.$transaction(async (tx) => {
    const products = await tx.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true },
    });
    if (products.length !== productIds.length) {
      throw badRequest("One or more products not found");
    }

    const created = await tx.purchase.create({
      data: {
        total,
        purchasedAt,
        lines: {
          create: lines.map((l) => ({
            productId: l.productId,
            quantity: l.quantity,
            unitCost: l.unitCost,
            lineTotal: l.lineTotal,
          })),
        },
      },
      select: purchaseSelect,
    });

    // Batch stock increments (one update per product, summed qty)
    const qtyByProduct = new Map<string, number>();
    for (const l of lines) {
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

    return created;
  });

  return serialize(purchase);
};

export const deletePurchase = async (id: string) => {
  await prisma.$transaction(async (tx) => {
    const purchase = await tx.purchase.findUnique({
      where: { id },
      select: {
        id: true,
        lines: { select: { productId: true, quantity: true } },
      },
    });
    if (!purchase) throw notFound("Purchase not found");

    const qtyByProduct = new Map<string, number>();
    for (const l of purchase.lines) {
      qtyByProduct.set(l.productId, (qtyByProduct.get(l.productId) ?? 0) + l.quantity);
    }

    await Promise.all(
      [...qtyByProduct.entries()].map(([productId, quantity]) =>
        tx.product.update({
          where: { id: productId },
          data: { stock: { decrement: quantity } },
        }),
      ),
    );

    await tx.purchase.delete({ where: { id } });
  });
};
