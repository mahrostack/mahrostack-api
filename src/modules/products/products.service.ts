import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { badRequest, conflict, notFound } from "@/lib/errors";
import { moneyString, toDecimal } from "@/lib/money";

const productSelect = {
  id: true,
  name: true,
  sku: true,
  description: true,
  unitPrice: true,
  stock: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ProductSelect;

type ProductRow = Prisma.ProductGetPayload<{ select: typeof productSelect }>;

const serialize = (p: ProductRow) => ({
  ...p,
  unitPrice: moneyString(p.unitPrice),
});

export type CreateProductInput = {
  name: string;
  sku?: string | null;
  description?: string | null;
  unitPrice?: number | string;
  stock?: number;
};

export type UpdateProductInput = {
  name?: string;
  sku?: string | null;
  description?: string | null;
  unitPrice?: number | string;
  stock?: number;
};

export const listProducts = async (q?: string) => {
  const products = await prisma.product.findMany({
    ...(q
      ? {
          where: {
            OR: [
              { name: { contains: q, mode: "insensitive" as const } },
              { sku: { contains: q, mode: "insensitive" as const } },
            ],
          },
        }
      : {}),
    select: productSelect,
    orderBy: { createdAt: "desc" },
  });
  return products.map(serialize);
};

export const getProduct = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id },
    select: productSelect,
  });
  if (!product) throw notFound("Product not found");
  return serialize(product);
};

export const createProduct = async (input: CreateProductInput) => {
  const name = input.name?.trim();
  if (!name) throw badRequest("name is required");

  const stock = input.stock ?? 0;
  if (!Number.isInteger(stock) || stock < 0) {
    throw badRequest("stock must be a non-negative integer");
  }

  let unitPrice: Prisma.Decimal;
  try {
    unitPrice = toDecimal(input.unitPrice ?? 0);
  } catch {
    throw badRequest("unitPrice is invalid");
  }
  if (unitPrice.lt(0)) throw badRequest("unitPrice must be >= 0");

  try {
    const product = await prisma.product.create({
      data: {
        name,
        sku: input.sku?.trim() || null,
        description: input.description?.trim() || null,
        unitPrice,
        stock,
      },
      select: productSelect,
    });
    return serialize(product);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw conflict("sku already exists");
    }
    throw err;
  }
};

export const updateProduct = async (id: string, input: UpdateProductInput) => {
  const data: Prisma.ProductUpdateInput = {};

  if (input.name !== undefined) {
    const name = input.name.trim();
    if (!name) throw badRequest("name cannot be empty");
    data.name = name;
  }
  if (input.sku !== undefined) {
    data.sku = input.sku?.trim() || null;
  }
  if (input.description !== undefined) {
    data.description = input.description?.trim() || null;
  }
  if (input.unitPrice !== undefined) {
    let unitPrice: Prisma.Decimal;
    try {
      unitPrice = toDecimal(input.unitPrice);
    } catch {
      throw badRequest("unitPrice is invalid");
    }
    if (unitPrice.lt(0)) throw badRequest("unitPrice must be >= 0");
    data.unitPrice = unitPrice;
  }
  if (input.stock !== undefined) {
    if (!Number.isInteger(input.stock) || input.stock < 0) {
      throw badRequest("stock must be a non-negative integer");
    }
    data.stock = input.stock;
  }

  try {
    const product = await prisma.product.update({
      where: { id },
      data,
      select: productSelect,
    });
    return serialize(product);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") throw notFound("Product not found");
      if (err.code === "P2002") throw conflict("sku already exists");
    }
    throw err;
  }
};

export const deleteProduct = async (id: string) => {
  try {
    await prisma.product.delete({ where: { id } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") throw notFound("Product not found");
      if (err.code === "P2003") {
        throw conflict("Product is referenced by purchases or sales");
      }
    }
    throw err;
  }
};
