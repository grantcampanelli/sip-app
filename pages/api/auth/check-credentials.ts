import type { NextApiRequest, NextApiResponse } from "next";
import prisma from '../../../lib/prismadb';
import sha256 from "crypto-js/sha256";
//import { logger } from "lib/logger";
import { omit } from "lodash";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    console.log("request body", req.body);
    console.log("made it to the check credentials post");
    await handlePOST(res, req);
  } 
  else if (req.method === "GET") { 
    console.log("made it to get check credentials")
    console.log("request body", req.body);
    res.status(200).json({ name: "John Doe" });
  }

   else {
    throw new Error(
      `The HTTP ${req.method} method is not supported at this route.`,
    );
  }
}

const hashPassword = (password: string) => {
  return sha256(password).toString();
};

// POST /api/user
async function handlePOST(res: NextApiResponse, req: NextApiRequest) {
  console.log("made it to the check credentials post");
type UserSelect = {
    id?: boolean;
    name?: boolean;
    email?: boolean;
    image?: boolean;
    password?: boolean; // Add 'password' field to the UserSelect type
};

const user = await prisma.user.findUnique({
    where: { email: req.body.username },
    select: {
        id: true,
        name: true,
        email: true,
        image: true,
        password: true,
    },
});

if (user && (user as any).password == hashPassword(req.body.password)) {
    //logger.debug("password correct");
    console.log("password correct");
    res.json(omit(user, "password"));
} else {
//  logger.debug("incorrect credentials");
console.log("password incorrect");
console.log("user: ", user)
    res.status(400).end("Invalid credentials");
}}