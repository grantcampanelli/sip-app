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
  const { name, order, capacity, temp, stashId } = req.body;

  console.log("POST body: ", req.body);

  const result = await prisma.shelf.create({
    data: {
      name: name,
      order: order,
      capacity: capacity,
      temp: temp,
      stashId: stashId,
    },
    select: {
      id: true,
      name: true,
      order: true,
      capacity: true,
      temp: true,
      stashId: true,
    },
  });
  res.json(result);
}
