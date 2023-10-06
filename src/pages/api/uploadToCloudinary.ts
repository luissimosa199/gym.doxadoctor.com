import { NextApiRequest, NextApiResponse } from "next";
import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_API_KEY,
  api_secret: process.env.NEXT_PUBLIC_API_SECRET,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case "POST":
      const fileStr = req.body.data;
      try {
        const uploadedResponse = await cloudinary.v2.uploader.upload(fileStr, {
          upload_preset: "qxkzlm62",
        });
        if (uploadedResponse) {
          const { api_key, signature, ...responseData } = uploadedResponse;
          res.status(200).json({ success: true, data: responseData });
        } else {
          res.status(500).json({ success: false, data: "No image uploaded" });
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, data: error });
      }
      break;
    default:
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "100mb",
    },
  },
}
