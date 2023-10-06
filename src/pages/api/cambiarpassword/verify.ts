import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../db/dbConnect";
import { UserModel } from "../../../db/models/userModel";
import { VerifyCodeModel } from "@/db/models/VerifyCodeModel";
import sendgrid from "@sendgrid/mail";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).end(); // Method Not Allowed
  }

  const { email, code } = req.body;

  // Input validation
  if (!email) {
    return res.status(400).json({ error: "Campos requeridos incompletos." });
  }

  await dbConnect();

  const existingUser = await UserModel.findOne({ email });
  if (!existingUser) {
    return res.status(404).json({ error: "Usuario no encontrado." });
  }

  try {
    if (!code) {
      const uuid = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;

      const createNewCode = new VerifyCodeModel({
        email: email,
        code: uuid,
      });

      await createNewCode.save();

      sendgrid.setApiKey(process.env.SEND_GRID_API_KEY as string);

      //   const emailHtml = render(DoxaEmail(user) as ReactElement );
      const emailHtml = `<p> Este es tu codigo de validacion: ${uuid} </p>`;

      const options = {
        from: "javier.doxadoctor@gmail.com",
        to: email,
        subject: "Cambia tu contraseña",
        html: emailHtml,
      };

      await sendgrid.send(options);

      return res.status(200).json({ message: "Codigo creado y enviado" });
    } else {
      const verifyCode = await VerifyCodeModel.find({ code: code });

      if (verifyCode) {
        return res.status(200).json({ message: "Codigo validado" });
      } else {
        return res.status(500).json({ error: "Codigo incorrecto" });
      }
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: `Error: ${error}` });
  }
}
