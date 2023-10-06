import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../db/dbConnect";
import { StudentModel, UserAgentModel } from "../../db/models";
import { serialize, parse } from "cookie";
import { v4 as uuidv4 } from "uuid";
import { UserModel } from "@/db/models/userModel";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userData, id } = req.body;

  const session = await getServerSession(req, res, authOptions);

  if (session && session.user) {
    const userId = session.user.email;
    const cookies = parse(req.headers.cookie || "");
    const userAgentId = cookies.user_agent_id;

    const updatedUser = await UserModel.findOneAndUpdate(
      { email: userId },
      { $addToSet: { user_agent_id: userAgentId } },
      { new: true, upsert: false }
    );
  }

  if (req.method === "POST") {
    const newId = uuidv4();
    try {
      await dbConnect();
      const userAgent = new UserAgentModel({ visits: [userData], _id: newId });

      await userAgent.save();
    } catch (error) {
      console.error("Error creating UserAgent:", error);
      res.status(500).json({ error: "Failed to create userAgent" });
    }

    res.setHeader(
      "Set-Cookie",
      serialize(`user_agent_id`, newId, {
        httpOnly: false,
        secure: process.env.NODE_ENV !== "development",
        expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        sameSite: "strict",
        path: "/",
      })
    );
    res.status(200).json({ message: "userAgent registered" });
  } else if (req.method === "PUT") {
    try {
      await dbConnect();
      await UserAgentModel.findByIdAndUpdate(id, {
        $push: { visits: userData },
      });

      res.status(200).json({ message: "UserAgent updated" });
    } catch (error) {
      console.error("Error updating UserAgent:", error);
      res.status(500).json({ error: "Failed to update userAgent" });
    }
  } else if (req.method === "GET") {
    const { username } = req.query;

    if (username) {
      try {
        await dbConnect();

        const countResults = await UserAgentModel.aggregate([
          {
            $unwind: "$visits", // Flatten the array
          },
          {
            $match: {
              "visits.entry_point": new RegExp(
                (username as string).split("@")[0] + "$"
              ), // Match entry_point that ends with username
            },
          },
          {
            $count: "count",
          },
        ]);

        const visitsCount = countResults.length > 0 ? countResults[0].count : 0;

        const studentsCount = await StudentModel.countDocuments({
          instructor: username,
        });

        res.status(200).json({ visitsCount, studentsCount });

        return;
      } catch (error) {
        console.error("Error updating UserAgent:", error);
        res.status(500).json({ error: "Failed to retrieve userAgent data" });
      }
    }

    try {
      await dbConnect();

      const userAgentData = await UserAgentModel.find();

      const users = await UserModel.find({
        user_agent_id: { $exists: true },
      }).select("email user_agent_id");

      res.status(200).json({
        userAgentData,
        users,
      });
    } catch (error) {
      console.error("Error updating UserAgent:", error);
      res.status(500).json({ error: "Failed to retrieve userAgent data" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
