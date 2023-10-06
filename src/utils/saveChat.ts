import { ChatMessage } from "@/types";

interface SaveChatParams {
  room: string;
  newMessage: ChatMessage;
}

export async function saveChat({ room, newMessage }: SaveChatParams) {
  try {
    const response = await fetch(`/api/chat/${room}`, {
      method: "POST",
      body: JSON.stringify({
        timestamp: newMessage.timestamp?.toISOString(),
        user: newMessage.user,
        message: newMessage.message,
        files: newMessage.files, // send the files array
      }),
    });

    if (response.ok) {
      return;
    } else {
      const responseData = await response.json();
      console.error("Error saving message:", responseData);
    }
  } catch (error: any) {
    console.error("Error sending POST request:", error.message);
  }
}
