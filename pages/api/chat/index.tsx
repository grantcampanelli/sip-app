import { NextApiResponse, NextApiRequest } from "next";
import prisma from "../../../lib/prismadb";
import { getSession } from "next-auth/react";
import { getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { generateText } from 'ai';



export default async function handle(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if(req.method === "GET") {
        res.status(200).json({ message: "GET request to /api/chat" });
        return;
    }
    if (req.method === "POST") {
        await handlePOST(res, req);
    } else {
        throw new Error(
            `The HTTP ${req.method} method is not supported at this route.`
        );
    }
}
export const maxDuration = 30;
async function handlePOST(res: NextApiResponse, req: NextApiRequest) {


    const { promptInput } = req.body;
    const session = await getServerSession(req, res, authOptions);
    let newPrompt = "Tell me about the following product if you know about it: " + promptInput;

    const result = await generateText({
        model: openai('gpt-4o-mini'),
        prompt: newPrompt,
    });
    res.json(result.text);
}
