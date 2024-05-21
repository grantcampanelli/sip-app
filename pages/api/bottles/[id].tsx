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
    else if (req.method === "DELETE") {
        await handleDELETE(res, req);
    }
    else {
        throw new Error(
            `The HTTP ${req.method} method is not supported at this route.`
        );
    }
}

async function handlePUT(res: NextApiResponse, req: NextApiRequest) {
    // const { shelfId, bottleId, order } = req.body;
    const bottleId = req.query.id as string;
    const session = await getServerSession(req, res, authOptions);
    const userId = session?.user?.id;
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    const { purchasePrice, purchaseDate, amountRemaining, notes } = req.body;
    console.log("try to update bottle: ", bottleId);
    const result = await prisma.bottle.update({ // Fix: Change from delete to upsert
        where: { id: bottleId },
        data: {
            purchasePrice: purchasePrice,
            purchaseDate: purchaseDate,
            amountRemaining: amountRemaining,
            notes: notes
        }
    });
    res.json(result);
}

async function handleDELETE(res: NextApiResponse, req: NextApiRequest) {
    const bottleId = req.query.id as string;
    const session = await getServerSession(req, res, authOptions);
    const userId = session?.user?.id;
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    const result = await prisma.bottle.delete({
        where: { id: bottleId }
    });
    res.json(result);
}
