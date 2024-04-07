import { NextApiResponse, NextApiRequest } from "next";
import prisma from "../../../lib/prismadb";
import { getSession } from "next-auth/react";
import { getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "DELETE") {
    await handleDELETE(res, req);
  } else {
    throw new Error(
      `The HTTP ${req.method} method is not supported at this route.`
    );
  }
}

async function handleDELETE(res: NextApiResponse, req: NextApiRequest) {
  const { shelfId, bottleId, order } = req.body;
  const session = await getServerSession(req, res, authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const brandId = req.query.id as string; // Fix: Ensure postId is of type string

  console.log("try to delete brand: ", brandId);
  const result = await prisma.brand.delete({
    where: { id: brandId },
  });
  res.json(result);
}
