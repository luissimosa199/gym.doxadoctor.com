import clientPromise from "@/utils/mongoDbPromise";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { NextApiRequest, NextApiResponse } from "next";
import { NextAuthOptions } from "next-auth";
import { Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import NextAuth from "next-auth";
import { Adapter, AdapterUser } from "next-auth/adapters";
import dbConnect from "@/db/dbConnect";
import { UserModel } from "@/db/models/userModel";

export interface CustomSession extends Session {
  role?: string;
}

interface CustomAdapterUser extends AdapterUser {
  role?: string; // Assuming role is of type string; adjust as necessary
}

export interface CustomNextApiRequest extends NextApiRequest {
  // Add any custom request properties here
}

export interface CustomNextApiResponse<T = any> extends NextApiResponse<T> {
  // Add any custom response properties here
}

export const authOptions: NextAuthOptions = {

  providers: [
    CredentialsProvider({
      name: "credentials",
      id: "credentials",

      credentials: {
        email: {
          label: "Email",
          type: "text",
        },
        password: { label: "Contraseña", type: "password" },
      },

      async authorize(credentials, req) {
        if (!credentials) {
          return null;
        }

        try {
          await dbConnect();
          const user = await UserModel.findOne({ email: credentials.email });

          if (!user) {
            return null;
          }

          const isValid = await user.validatePassword(credentials.password);

          if (!isValid) {
            return null;
          }
          return {
            id: user._id,
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role,
          };
        } catch (error) {
          console.error(error);
          return null;
        }
      },
    }),

    // ...add more providers here
  ],

  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.role = (user as CustomAdapterUser).role;
        token.picture = user.image;
      }
      return token;
    },
    session: async ({ session, token }) => {
        (session as CustomSession).role = (token as any).role; 
        return session;
    },
  },

  adapter: MongoDBAdapter(clientPromise) as Adapter,

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
};

const NextAuthHandler = (
  req: CustomNextApiRequest,
  res: CustomNextApiResponse
) => NextAuth(req, res, authOptions);

export default NextAuthHandler;
