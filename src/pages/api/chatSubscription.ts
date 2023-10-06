import dbConnect from "@/db/dbConnect";
import { UserAgentModel } from "@/db/models";
import { VideoCallChatModel } from "@/db/models/videoCallChatModel";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  if (req.method === "POST") {
    const { user_agent_id, subscription, conversationId } = req.body;
    if (!user_agent_id || !subscription || !conversationId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      // Update the UserAgent with the subscription
      await UserAgentModel.findByIdAndUpdate(user_agent_id, {
        PushSubscription: subscription,
      });

      // Add the user_agent_id to the VideoCallChat's subscribedForNotifications list
      await VideoCallChatModel.findByIdAndUpdate(conversationId, {
        $addToSet: { subscribedForNotifications: user_agent_id },
      });

      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else if (req.method === "GET") {
    const { user_agent_id, conversationId } = req.query;

    if (!user_agent_id || !conversationId) {
      return res
        .status(400)
        .json({ error: "Missing required query parameters" });
    }

    try {
      const chat = await VideoCallChatModel.findById(conversationId);

      const isSubscribed = chat?.subscribedForNotifications?.includes(
        user_agent_id as string
      );

      res.status(200).json({ isSubscribed });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else if (req.method === "DELETE") {
    const { user_agent_id, conversationId } = req.body;

    if (!user_agent_id || !conversationId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      await VideoCallChatModel.findByIdAndUpdate(conversationId, {
        $pull: { subscribedForNotifications: user_agent_id },
      });

      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
