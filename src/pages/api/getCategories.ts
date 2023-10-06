import { StudentModel, TimeLineModel } from "../../db/models";
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../db/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  if (req.method === "GET") {
    try {
      const session = await getServerSession(req, res, authOptions);

      if (!session || !session.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const students = await StudentModel.find({
        instructor: session.user.email,
      }).select("email");

      const tags = await TimeLineModel.distinct("tags", {
        authorId: {
          $in: [...students.map((e) => e.email), session.user.email],
        },
      });

      res.status(200).json(tags);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
