import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../db/dbConnect";
import { VideoCallChatModel } from "@/db/models/videoCallChatModel";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();
  const room = req.query.room as string;

  if (req.method === "GET") {
    const { limit: limitStr, beforeTimestamp } = req.query;

    if (!room || room === "null") {
      return res.status(400).json({ error: "Invalid room name provided." });
    }

    const limit = parseInt((limitStr as string) || "10");
    const beforeDate = beforeTimestamp
      ? new Date(Number(beforeTimestamp)).toISOString()
      : null;
    const chat = await VideoCallChatModel.findById(room);

    if (chat && chat.messages) {
      // Ensure messages are sorted by timestamp in descending order
      const sortedMessages = chat.messages.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      // Filter messages that are newer than the provided timestamp
      const filteredMessages = beforeDate
        ? sortedMessages.filter(
            (msg) =>
              new Date(msg.timestamp).getTime() < new Date(beforeDate).getTime()
          )
        : sortedMessages;

      // Take the first 'limit' number of messages from the filtered list
      const nextMessages = filteredMessages.slice(0, limit).reverse();

      const oldestTimestamp =
        nextMessages.length > 0 ? nextMessages[0].timestamp : null;

      res.status(200).json({ messages: nextMessages, oldestTimestamp });
    }
  } else if (req.method === "POST") {
    const body = JSON.parse(req.body);

    const chat = await VideoCallChatModel.findById(room);

    if (chat) {
      const updateChat = await VideoCallChatModel.findByIdAndUpdate(
        room,
        {
          $push: {
            messages: {
              timestamp: body.timestamp,
              user: body.user,
              message: body.message,
              files: body.files,
            },
          },
        },
        { new: true }
      ).catch((err) => {
        console.error("Update Error:", err);
        res.status(500).json({ error: "Update Error" });
      });

      if (updateChat) {
        res.status(200).json(body);
      }
    } else {
      const newChat = new VideoCallChatModel({
        _id: room,
        messages: [body.message],
      });
      await newChat.save();
      res.status(201).json(newChat);
    }
  }
}
