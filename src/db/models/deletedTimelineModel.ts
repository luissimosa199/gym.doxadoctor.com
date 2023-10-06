import { prop } from "@typegoose/typegoose";
import { Timeline } from "./timelineModel";

export class DeletedTimeline extends Timeline {
  @prop({ default: () => new Date() })
  deletedAt: Date;
}
