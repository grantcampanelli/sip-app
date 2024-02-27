import { NextApiResponse, NextApiRequest } from "next";
import prisma from "../../../lib/prismadb";
import { getSession } from "next-auth/react";
// import { getUserId } from '../../lib/nextAuth';

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
  const secret = process.env.SECRET;
  const session = await getSession({ req });
  console.log("session: ", session);
  console.log("userid to fetch bottles for: ", session?.user?.id ?? null);
  const bottles = await prisma.bottle.findMany({
    where: {
      userId: session?.user?.id,
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

  console.log("POST body: ", req.body);
  const session = await getSession({ req });
  if (!session?.user?.id) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const result = await prisma.bottle.create({
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
      userId: session?.user?.id,
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
