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
  const { name } = req.body;

  console.log("POST body: ", req.body);

  const result = await prisma.brand.create({
    data: {
      name: name,
    },
    select: {
      id: true,
      name: true,
    },
  });
  res.json(result);
}
