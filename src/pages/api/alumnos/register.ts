import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../db/dbConnect";
import { StudentModel } from "../../../db/models"; // Adjust the path to your User model
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { name, email, tlf, details, instructor, tags } = req.body;

  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user || session.user.email !== instructor) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== "POST") {
    return res.status(405).end(); // Method Not Allowed
  }

  if (!name || !instructor) {
    return res.status(400).json({ error: "Campos requeridos incompletos." });
  }

  await dbConnect();

  try {
    const existingUser = await StudentModel.findOne({
      instructor: session.user.email,
      name,
    });
    if (existingUser) {
      return res
        .status(409)
        .json({ error: "Studente con el mismo nombre ya existe" });
    }

    // Create the user
    const user = new StudentModel({
      name,
      email,
      tlf,
      details,
      instructor,
      tags,
    });
    await user.save();

    return res
      .status(201)
      .json({ message: "Studente registrado correctamente." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: `Error: ${error}` });
  }
}
