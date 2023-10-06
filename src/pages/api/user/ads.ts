import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../db/dbConnect";
import { UserModel } from "@/db/models/userModel";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  const { username } = req.query;
  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  try {
    if (req.method === "PUT") { // Switching to PUT for updating resources
      const { disableAds } = req.body;

      // Checking if the provided value is boolean
      if (typeof disableAds !== "boolean") {
        return res
          .status(400)
          .json({ error: "disableAds field is required and must be a boolean" });
      }

      const updatedUser = await UserModel.findOneAndUpdate(
        { email: username },
        { $set: { disableAds } },
        { new: true }
      ).select("disableAds");

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.status(200).json({ disableAds: updatedUser.disableAds });
    } else if (req.method === "GET") {
      const user = await UserModel.findOne({ email: username }).select("disableAds");
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.status(200).json({ disableAds: user.disableAds });
    } else {
      return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error in API handler:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
