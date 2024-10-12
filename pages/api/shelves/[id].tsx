import { NextApiResponse, NextApiRequest } from "next";
import prisma from "../../../lib/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";

export default async function handle(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "PUT") {
        await handlePUT(res, req);
    }
    else {
        throw new Error(
            `The HTTP ${req.method} method is not supported at this route.`
        );
    }
}



async function handlePUT(res: NextApiResponse, req: NextApiRequest) {
    const { name, order, capacity, temp, stashId } = req.body;
    const shelfId = req.query.id as string;

    const session = await getServerSession(req, res, authOptions);
    const userId = session?.user?.id;
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    const result = await prisma.shelf.update({
        where: { id: shelfId },
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