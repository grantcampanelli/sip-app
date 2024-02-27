import { NextApiResponse, NextApiRequest } from "next";
import prisma from "../../../lib/prismadb";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    await handlePOST(res, req);
  } else {
    throw new Error(
      `The HTTP ${req.method} method is not supported at this route.`
    );
  }
}

async function handlePOST(res: NextApiResponse, req: NextApiRequest) {
  const { name, vintage, varietal, brandId } = req.body;

  console.log("POST body: ", req.body);

  const result = await prisma.product.create({
    data: {
      name: name,
      vintage: vintage,
      varietal: varietal,
      brandId: brandId,
    },
    select: {
      id: true,
      name: true,
    },
  });
  res.json(result);
}
