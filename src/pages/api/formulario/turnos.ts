import dbConnect from "@/db/dbConnect";
import { FormTurnosModel } from "@/db/models/FormTurnosModel";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).end(); // Method Not Allowed
  }
  await dbConnect();

  const formData = req.body;

  const newFormEntry = new FormTurnosModel({
    ...formData,
  });

  try {
    await newFormEntry.save();

    res.status(200).json({ success: true, data: formData });
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
}
