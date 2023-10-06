import webPush from "web-push";

webPush.setVapidDetails(
  "mailto:luissimosaarg@gmail.com", // Your email
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string, // Your VAPID public key
  process.env.VAPID_PRIVATE_KEY as string // Your VAPID private key
);
