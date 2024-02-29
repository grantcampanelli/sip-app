import { NextApiResponse, NextApiRequest } from "next";
import prisma from "../../../lib/prismadb";
import { getSession } from "next-auth/react";
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
  const secret = process.env.SECRET;
  const session = await getServerSession(req, res, authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const stashes = await prisma.stash.findMany({
    where: {
      userId: userId,
    },
  });
  res.json(stashes);
}

async function handlePOST(res: NextApiResponse, req: NextApiRequest) {
  const { name, location, type } = req.body;

  const session = await getServerSession(req, res, authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const result = await prisma.stash.create({
    data: {
      name: name,
      location: location,
      type: type,
      userId: userId,
    },
    select: {
      id: true,
      name: true,
      location: true,
      type: true,
      userId: true,
    },
  });
  res.json(result);
}
