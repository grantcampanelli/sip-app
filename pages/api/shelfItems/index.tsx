import { NextApiResponse, NextApiRequest } from "next";
import prisma from "../../../lib/prismadb";
import { getSession } from "next-auth/react";
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
  const { shelfId, bottleId, order } = req.body;

  console.log("POST body: ", req.body);
  const session = await getSession({ req });
  const userId = session?.user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const result = await prisma.shelfItem.create({
    data: {
      shelfId: shelfId,
      bottleId: bottleId,
      order: order,
    },
    select: {
      id: true,
      shelfId: true,
      bottleId: true,
      order: true,
    },
  });
  res.json(result);
}
