import { NextApiResponse, NextApiRequest } from "next";
import prisma from "../../../lib/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    await handleGET(res, req);
  } else {
    throw new Error(
      `The HTTP ${req.method} method is not supported at this route.`
    );
  }
}

function escapeCSV(value: any): string {
  if (value === null || value === undefined) {
    return "";
  }
  const stringValue = String(value);
  // If the value contains comma, quote, or newline, wrap it in quotes and escape quotes
  if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

function formatDate(date: Date | null | undefined): string {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0];
}

async function handleGET(res: NextApiResponse, req: NextApiRequest) {
  const session = await getServerSession(req, res, authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    // Fetch all user data with relations
    const bottles = await prisma.bottle.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            brand: true,
          },
        },
        shelfItem: {
          include: {
            shelf: {
              include: {
                stash: true,
              },
            },
          },
        },
      },
    });

    const products = await prisma.product.findMany({
      where: {
        bottles: {
          some: {
            userId,
          },
        },
      },
      include: {
        brand: true,
      },
    });

    const brands = await prisma.brand.findMany({
      where: {
        products: {
          some: {
            bottles: {
              some: {
                userId,
              },
            },
          },
        },
      },
    });

    const stashes = await prisma.stash.findMany({
      where: { userId },
      include: {
        shelves: {
          include: {
            shelfItems: {
              include: {
                bottle: {
                  include: {
                    product: {
                      include: {
                        brand: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    // Create CSV rows
    const csvRows: string[] = [];

    // Header row for bottles (main export)
    const headers = [
      "bottle_id",
      "bottle_size",
      "bottle_serving_size",
      "bottle_purchase_price",
      "bottle_purchase_date",
      "bottle_open_date",
      "bottle_finished",
      "bottle_finish_date",
      "bottle_amount_remaining",
      "bottle_notes",
      "product_id",
      "product_name",
      "product_vintage",
      "product_varietal",
      "product_region",
      "brand_id",
      "brand_name",
      "brand_type",
      "shelf_item_id",
      "shelf_item_order",
      "shelf_id",
      "shelf_name",
      "shelf_order",
      "shelf_capacity",
      "shelf_temp",
      "stash_id",
      "stash_name",
      "stash_location",
      "stash_type",
    ];

    csvRows.push(headers.map(escapeCSV).join(","));

    // Add bottle rows
    for (const bottle of bottles) {
      const row = [
        bottle.id,
        bottle.size ?? "",
        bottle.servingSize ?? "",
        bottle.purchasePrice ?? "",
        formatDate(bottle.purchaseDate),
        formatDate(bottle.openDate),
        bottle.finished ?? "",
        formatDate(bottle.finishDate),
        bottle.amountRemaining ?? "",
        bottle.notes ?? "",
        bottle.product.id,
        bottle.product.name,
        bottle.product.vintage,
        bottle.product.varietal,
        bottle.product.region ?? "",
        bottle.product.brand.id,
        bottle.product.brand.name,
        bottle.product.brand.type,
        bottle.shelfItem?.id ?? "",
        bottle.shelfItem?.order ?? "",
        bottle.shelfItem?.shelf.id ?? "",
        bottle.shelfItem?.shelf.name ?? "",
        bottle.shelfItem?.shelf.order ?? "",
        bottle.shelfItem?.shelf.capacity ?? "",
        bottle.shelfItem?.shelf.temp ?? "",
        bottle.shelfItem?.shelf.stash?.id ?? "",
        bottle.shelfItem?.shelf.stash?.name ?? "",
        bottle.shelfItem?.shelf.stash?.location ?? "",
        bottle.shelfItem?.shelf.stash?.type ?? "",
      ];
      csvRows.push(row.map(escapeCSV).join(","));
    }

    // Add a separator section for standalone products (products without bottles)
    const productsWithoutBottles = products.filter(
      (p) => !bottles.some((b) => b.productId === p.id)
    );
    if (productsWithoutBottles.length > 0) {
      csvRows.push(""); // Empty row separator
      csvRows.push("Products without bottles:");
      const productHeaders = [
        "product_id",
        "product_name",
        "product_vintage",
        "product_varietal",
        "product_region",
        "brand_id",
        "brand_name",
        "brand_type",
      ];
      csvRows.push(productHeaders.map(escapeCSV).join(","));
      for (const product of productsWithoutBottles) {
        const row = [
          product.id,
          product.name,
          product.vintage,
          product.varietal,
          product.region ?? "",
          product.brand.id,
          product.brand.name,
          product.brand.type,
        ];
        csvRows.push(row.map(escapeCSV).join(","));
      }
    }

    // Add a separator section for standalone brands (brands without products)
    const brandsWithoutProducts = brands.filter(
      (b) => !products.some((p) => p.brandId === b.id)
    );
    if (brandsWithoutProducts.length > 0) {
      csvRows.push(""); // Empty row separator
      csvRows.push("Brands without products:");
      const brandHeaders = ["brand_id", "brand_name", "brand_type"];
      csvRows.push(brandHeaders.map(escapeCSV).join(","));
      for (const brand of brandsWithoutProducts) {
        const row = [brand.id, brand.name, brand.type];
        csvRows.push(row.map(escapeCSV).join(","));
      }
    }

    // Add a separator section for stashes and shelves
    if (stashes.length > 0) {
      csvRows.push(""); // Empty row separator
      csvRows.push("Stashes and Shelves:");
      const stashHeaders = [
        "stash_id",
        "stash_name",
        "stash_location",
        "stash_type",
        "shelf_id",
        "shelf_name",
        "shelf_order",
        "shelf_capacity",
        "shelf_temp",
      ];
      csvRows.push(stashHeaders.map(escapeCSV).join(","));
      for (const stash of stashes) {
        if (stash.shelves.length === 0) {
          // Stash without shelves
          const row = [
            stash.id,
            stash.name,
            stash.location,
            stash.type,
            "",
            "",
            "",
            "",
            "",
          ];
          csvRows.push(row.map(escapeCSV).join(","));
        } else {
          for (const shelf of stash.shelves) {
            const row = [
              stash.id,
              stash.name,
              stash.location,
              stash.type,
              shelf.id,
              shelf.name,
              shelf.order ?? "",
              shelf.capacity,
              shelf.temp,
            ];
            csvRows.push(row.map(escapeCSV).join(","));
          }
        }
      }
    }

    const csvContent = csvRows.join("\n");

    // Set headers for CSV download
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="sip-app-export-${new Date().toISOString().split("T")[0]}.csv"`
    );
    res.setHeader("Content-Length", Buffer.byteLength(csvContent, "utf8").toString());

    res.status(200).send(csvContent);
  } catch (error) {
    console.error("Export error:", error);
    res.status(500).json({ message: "Error exporting data", error: String(error) });
  }
}

