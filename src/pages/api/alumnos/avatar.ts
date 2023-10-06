import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../db/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { StudentModel } from "@/db/models";
import mongoose from "mongoose";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  await dbConnect();

  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "UserId is required" });
  }

  let queryId;
  if (mongoose.Types.ObjectId.isValid(userId as string)) {
    queryId = new mongoose.Types.ObjectId(userId as string);
  } else {
    queryId = userId as string;
  }

  try {
    if (req.method === "POST") {
      const { image } = req.body;

      if (!image || typeof image !== "string") {
        return res
          .status(400)
          .json({ error: "Photo is required and must be a string" });
      }

      const updatedUser = await StudentModel.findOneAndUpdate(
        { _id: queryId },
        { $set: { image } },
        { new: true }
      ).select("image");

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.status(200).json({ image: updatedUser.image });
    } else if (req.method === "GET") {
      const user = await StudentModel.findOne({ _id: queryId }).select("image");
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.status(200).json({ image: user.image });
    } else {
      return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error in API handler:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
