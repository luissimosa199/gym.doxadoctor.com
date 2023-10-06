import { DeletedTimelineModel, TimeLineModel } from "../../../db/models";
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../db/dbConnect";
import { authOptions } from "../auth/[...nextauth]";
import { getServerSession } from "next-auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  await dbConnect();
  const { id, username } = req.query;

  if (req.method === "GET") {

    const timeline = await TimeLineModel.findOne({
      _id: id,
      authorId: username || session.user?.email,
    });

    if (timeline) {
      res.status(200).json(timeline);
    } else {
      res.status(404);
    }
  } else if (req.method === "PUT") {

    const body = JSON.parse(req.body);
    const timeline = await TimeLineModel.findOne({
      _id: id,
      authorId: body.authorId,
    });

    if (timeline) {
      const updateResult = await TimeLineModel.updateMany(
        { _id: id, authorId: body.authorId },
        { $set: body }
      ).catch((err) => {
        console.error("Update Error:", err);
        res.status(500).json({ error: "Update Error" });
      });

      const updatedTimeline = await TimeLineModel.findOne({
        _id: id,
        authorId: body.authorId,
      });

      if (updatedTimeline) {
        res.status(200).json(updatedTimeline);
      }
    } else {
      res.status(404).send({ message: "Timeline not found" });
    }
  } else if (req.method === "DELETE") {
    try {
      const timeline = await TimeLineModel.findOne({
        _id: id,
        authorId: username || session.user?.email,
      });

      if (timeline) {
        const timelineObject = timeline.toObject();
        const deletedTimeline = new DeletedTimelineModel({
          ...timelineObject,
          deletedAt: new Date(),
        });

        await deletedTimeline.save();

        await TimeLineModel.findByIdAndRemove(id);

        res.status(200).json({ message: "Timeline successfully deleted" });
      } else {
        res.status(404).send({ message: "Timeline not found" });
      }
    } catch (err) {
      console.error("Delete Error:", err);
      res.status(500).json({ error: "Delete Error" });
    }
  }
}
