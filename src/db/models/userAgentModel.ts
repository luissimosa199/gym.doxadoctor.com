import { modelOptions, prop } from "@typegoose/typegoose";

@modelOptions({ options: { allowMixed: 0 } })
class Visit {
  @prop()
  timestamp: Date;

  @prop()
  utm_params: Record<string, string>;

  @prop()
  entry_point: string;

  @prop()
  device: Record<string, any>;

  @prop()
  os: Record<string, any>;

  @prop()
  browser: Record<string, any>;
}

class PushSubscriptionKeys {
  @prop({ required: true })
  p256dh!: string;

  @prop({ required: true })
  auth!: string;
}

@modelOptions({ options: { allowMixed: 0 } })
class PushSubscription {
  @prop({ required: true })
  endpoint!: string;

  @prop({ required: false }) // It can be null based on the Push API
  expirationTime?: number | null;

  @prop({ required: true })
  keys!: PushSubscriptionKeys;
}

export class UserAgent {
  @prop()
  _id: string;

  @prop({ required: false })
  PushSubscription?: PushSubscription;

  @prop({ type: () => [Visit] })
  visits: Visit[];
}
