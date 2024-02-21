import { NextApiResponse, NextApiRequest } from "next";
import prisma from "../../lib/prismadb";
import { getSession } from "next-auth/react";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    await handleGET(res, req);
  } else {
    throw new Error(
      `The HTTP ${req.method} method is not supported at this route.`
    );
  }
}

// POST /api/bottles
async function handleGET(res: NextApiResponse, req: NextApiRequest) {
  const secret = process.env.SECRET;
  const session = await getSession({ req });
  console.log("session: ", session);

  console.log("made it to the pull bottles get");
  // console.log("userid to fetch bottles for: ", session?.user?.id ?? null);
  const stashes = await prisma.stash.findMany({
    where: { userId: "clsdgpzsw00003ng9sazcvs1f" },
  });
  console.log("stashes: ", stashes);
  res.json(stashes);
}
