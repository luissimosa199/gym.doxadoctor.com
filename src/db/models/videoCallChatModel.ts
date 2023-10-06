import { modelOptions, prop, getModelForClass } from "@typegoose/typegoose";

class File {
  @prop({ required: true })
  url: string;

  @prop({ required: true })
  type: string;
}

export class Message {
  @prop()
  timestamp: string;

  @prop()
  user: string;

  @prop({ required: false })
  message?: string;

  @prop({ type: () => [File], default: [] })
  files: File[];
}

class CurrentCall {
  @prop()
  duration: number;

  @prop()
  initTime: Date;
}

@modelOptions({
  schemaOptions: {
    timestamps: true,
  },
  options: {
    allowMixed: 0,
  },
})
export class VideoCallChat {
  @prop()
  _id: string;

  @prop()
  url: string;

  @prop({ default: () => new Date() })
  createdAt: Date;

  @prop({ default: () => new Date() })
  updatedAt: Date;

  @prop()
  currentCall: CurrentCall;

  @prop()
  messages: Message[];

  @prop({ default: () => [] })
  subscribedForNotifications?: string[];
}

export const VideoCallChatModel = getModelForClass(VideoCallChat);
