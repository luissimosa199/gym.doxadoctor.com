import { prop } from "@typegoose/typegoose";

export class DeletedUserPhoto {
  @prop({ default: () => new Date() })
  deletedAt: Date;

  @prop()
  user: string;

  @prop()
  url: string;
}
