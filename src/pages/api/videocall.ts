import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../db/dbConnect";
import { VideoCallChatModel } from "@/db/models/videoCallChatModel";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();
  const room = req.query.room as string;

  if (req.method === "GET") {
    const chat = await VideoCallChatModel.findById(room);

    if (chat && chat.currentCall) {
      const currentTime = new Date().getTime();
      const initTime = new Date(chat.currentCall.initTime).getTime();
      const duration = chat.currentCall.duration;
      const endTime = initTime + duration;
      const timeLeft = endTime - currentTime;

      const timeLeftInMinutes = Math.floor(timeLeft / (60 * 1000));

      if (timeLeft <= 0) {
        await VideoCallChatModel.findByIdAndUpdate(room, {
          $set: {
            currentCall: null,
          },
        });

        return res.status(404).json({ error: "Chat not found" });
      }

      res.status(200).json({ timeLeft: timeLeftInMinutes });
    } else {
      res.status(404).json({ error: "Chat not found" });
    }
  } else if (req.method === "POST") {
    const body = req.body;

    const initTime = new Date();
    const duration = body.duration;

    const chat = await VideoCallChatModel.findById(room);

    if (chat) {
      if (chat.currentCall) {
        const currentTime = new Date().getTime();
        const chatInitTime = new Date(chat.currentCall.initTime).getTime();
        const chatDuration = chat.currentCall.duration;
        const endTime = chatInitTime + chatDuration;
        const timeLeft = endTime - currentTime;

        if (timeLeft > 0) {
          return res
            .status(400)
            .json({ error: "A call is already in progress." });
        }
      }

      const updateChat = await VideoCallChatModel.findByIdAndUpdate(
        room,
        {
          $set: {
            currentCall: {
              initTime,
              duration,
            },
          },
        },
        { new: true }
      ).catch((err) => {
        console.error("Update Error:", err);
        res.status(500).json({ error: "Update Error" });
      });

      if (updateChat) {
        res.status(200).json(updateChat);
      }
    } else {
      const newChat = new VideoCallChatModel({
        _id: room,
        messages: [],
        currentCall: {
          initTime,
          duration,
        },
      });
      await newChat.save();
      res.status(201).json(newChat);
    }
  }
}
