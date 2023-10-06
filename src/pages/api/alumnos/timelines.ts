import { TimeLineModel } from "../../../db/models";
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../db/dbConnect";
import { authOptions } from "../auth/[...nextauth]";
import { getServerSession } from "next-auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    await dbConnect();

    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { page, userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const perPage = 10;
    const skip = page ? parseInt(page as string) * perPage : 0;

    const response = await TimeLineModel.find({ authorId: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(perPage)
      .lean();

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching timelines:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
