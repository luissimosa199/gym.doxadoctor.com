import { UserAgentModel } from "@/db/models";
import webPush from "web-push";

export async function sendNotificationToUser(userId: string, payload: string) {
  const user = await UserAgentModel.findById(userId);

  if (!user || !user.PushSubscription) {
    throw new Error("User not found or not subscribed");
  }

  const pushConfig = {
    endpoint: user.PushSubscription.endpoint,
    keys: {
      auth: user.PushSubscription.keys.auth,
      p256dh: user.PushSubscription.keys.p256dh,
    },
  };

  return webPush.sendNotification(pushConfig, payload);
}
