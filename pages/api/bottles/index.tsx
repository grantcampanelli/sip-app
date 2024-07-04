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
  } else if (req.method === "POST") {
    await handlePOST(res, req);
  } else {
    throw new Error(
      `The HTTP ${req.method} method is not supported at this route.`
    );
  }
}

async function handleGET(res: NextApiResponse, req: NextApiRequest) {
  const session = await getServerSession(req, res, authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const bottles = await prisma.bottle.findMany({
    where: {
      userId: userId,
    },
  });
  res.json(bottles);
}

async function handlePOST(res: NextApiResponse, req: NextApiRequest) {
  const secret = process.env.SECRET;
  const {
    size,
    servingSize,
    purchasePrice,
    purchaseDate,
    openDate,
    finished,
    finishDate,
    amountRemaining,
    notes,
    productId,
  } = req.body;

  const session = await getServerSession(req, res, authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const result  = await prisma.bottle.create({
    data: {
      size: size,
      servingSize: servingSize,
      purchasePrice: purchasePrice,
      purchaseDate: purchaseDate,
      openDate: openDate,
      finished: finished,
      finishDate: finishDate,
      amountRemaining: amountRemaining,
      notes: notes,
      userId: userId,
      productId: productId,
    },
    select: {
      id: true,
      size: true,
      servingSize: true,
      purchasePrice: true,
      purchaseDate: true,
      openDate: true,
      finished: true,
      finishDate: true,
      amountRemaining: true,
      notes: true,
      userId: true,
    },
  });
  res.json(result);
}
