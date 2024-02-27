import { NextApiResponse, NextApiRequest } from "next";
import prisma from "../../../lib/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";

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

  const session = await getServerSession(req, res, authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

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
