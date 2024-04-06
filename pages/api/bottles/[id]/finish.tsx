import { NextApiResponse, NextApiRequest } from "next";
import prisma from "../../../../lib/prismadb";
import { getSession } from "next-auth/react";
import { getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";
import { now } from "lodash";
// import { getUserId } from '../../lib/nextAuth';

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

  const bottleId = req.query.id as string;
  const bottle = await prisma.bottle.update({
    where: { id: bottleId },
    data: { finishDate: new Date().toISOString(), finished: true },
  });
  res.json(bottle);
}
