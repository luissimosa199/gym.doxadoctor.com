import { modelOptions, prop, getModelForClass } from "@typegoose/typegoose";

@modelOptions({
  schemaOptions: {
    timestamps: true,
  },
})
export class VerifyCode {
  @prop({ required: true })
  email: string;

  @prop({ required: true })
  code: string;

}

export const VerifyCodeModel = getModelForClass(VerifyCode);
