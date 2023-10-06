import { modelOptions, prop, getModelForClass } from "@typegoose/typegoose";
import { nanoid } from "nanoid";
import bcrypt from "bcrypt";

@modelOptions({
  schemaOptions: {
    timestamps: true,
  },
  options: {
    allowMixed: 0,
  },
})
export class User {
  @prop({ default: () => nanoid(9) })
  _id: string;

  @prop({ required: true })
  name: string;

  @prop({ required: true, unique: true })
  email: string;

  @prop({ required: true })
  password: string;

  @prop()
  image?: string;

  @prop({ type: [String], default: [] })
  user_agent_id: string[];

  @prop()
  photos?: string[];

  @prop()
  emailVerified?: Date | null;

  @prop({ default: false })
  disableAds?: boolean;

  @prop({ default: "USER" })
  role?: string;

  static async hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
  }

  async validatePassword(password: string) {
    return await bcrypt.compare(password, this.password);
  }
}

export const UserModel = getModelForClass(User);
