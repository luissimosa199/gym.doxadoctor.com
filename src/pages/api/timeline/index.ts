// api/timeline
import { TimeLineModel } from "../../../db/models";
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../db/dbConnect";
import { TimelineFormInputs } from "@/types";
import { generateSlug } from "@/utils/formHelpers";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  await dbConnect();

  if (req.method === "GET") {
    const { tags, page } = req.query;
    const perPage = 10;
    const skip = page ? parseInt(page as string) * perPage : 0;

    if (tags) {
      const tagsArray = Array.isArray(tags) ? tags : [tags];
      const regexPatterns = tagsArray.map((tag) => new RegExp(`^${tag}`, "i"));

      const response = await TimeLineModel.find({
        authorId: session.user.email,
        tags: { $in: regexPatterns },
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(perPage)
        .lean();

      res.status(200).json(response);
    } else {
      const response = await TimeLineModel.find({ authorId: session.user.email })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(perPage)
        .lean();
      res.status(200).json(response);
    }

  } else if (req.method === "POST") {

    const { mainText, photo, length, tags, links, authorId, authorName } =
      JSON.parse(req.body) as TimelineFormInputs;

    let baseSlug = generateSlug(JSON.parse(req.body), 35, 50);
    let slug = baseSlug;

    let counter = 1;

    while (await TimeLineModel.exists({ urlSlug: slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const timeline = new TimeLineModel({
      mainText: mainText || "",
      photo: photo,
      length: length,
      tags: tags,
      links: links,
      authorId: authorId,
      authorName: authorName,
      urlSlug: slug,
    });

    await timeline.save();

    res.status(200).json(timeline.toJSON());
    
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
