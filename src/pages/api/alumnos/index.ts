import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../db/dbConnect";
import { DeletedStudentModel, StudentModel } from "@/db/models";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
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
  const { id } = req.query;

  let queryId;
  if (mongoose.Types.ObjectId.isValid(id as string)) {
    queryId = new mongoose.Types.ObjectId(id as string);
  } else {
    queryId = id as string;
  }

  try {
    if (req.method === "GET") {
      if (id) {
        const student = await StudentModel.findOne({ _id: queryId });
        return res.status(200).json(student);
      }

      const students = await StudentModel.find({
        instructor: session.user.email,
      })
        .select("email name image tags isArchived")
        .sort({ createdAt: -1 });
      if (!students) {
        return res.status(404).json({ error: "No students found" });
      }
      return res.status(200).json(students);
    } else if (req.method === "POST") {
      // migrar register?
      console.log("POST");
    } else if (req.method === "DELETE") {
      const student = await StudentModel.findOne({ _id: queryId });
      const studentObject = student?.toObject();

      const saveDeletedStudent = new DeletedStudentModel({
        ...studentObject,
        deletedAt: new Date(),
      });

      await saveDeletedStudent.save();

      const deletedStudent = await StudentModel.findOneAndRemove({
        _id: queryId,
      });

      if (deletedStudent) {
        res.status(204).end();
      } else {
        res.status(404).json({ message: "Student not found" });
      }
    } else if (req.method === "PUT") {
      try {
        const updateData = req.body;

        const updatedStudent = await StudentModel.findOneAndUpdate(
          { _id: queryId },
          updateData,
          {
            new: true,
          }
        );

        if (updatedStudent) {
          res.status(200).json(updatedStudent);
        } else {
          res.status(404).json({ message: "Student not found" });
        }
      } catch (error) {
        res
          .status(500)
          .json({ message: "Internal server error", error: error });
      }
    } else if (req.method === "PATCH") {
      try {
        const student = await StudentModel.findById(queryId);

        if (!student) {
          return res.status(404).json({ message: "Student not found" });
        }

        const newIsArchivedStatus = student.isArchived
          ? !student.isArchived
          : true;

        const updatedStudent = await StudentModel.findOneAndUpdate(
          { _id: queryId },
          { isArchived: newIsArchivedStatus },
          {
            new: true,
          }
        );

        res.status(200).json(updatedStudent);
      } catch (error) {
        res
          .status(500)
          .json({ message: "Internal server error", error: error });
      }
    } else {
      return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error in API handler:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
