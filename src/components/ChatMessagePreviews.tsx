import { mimeTypeToExtensionMap } from "@/utils/mimeTypeToExtensionMap";
import Image from "next/image";
import React from "react";

const ChatMessagePreviews = ({ previews }: { previews: string[] }) => {
  const getFileExtension = (dataUri: string) => {
    const match = dataUri.match(/data:([^;]+);/);

    if (match && match[1]) {
      const mimeType = match[1];
      const typeParts = mimeType.split("/");
      const type = typeParts.length > 1 ? typeParts[1] : "";

      return mimeTypeToExtensionMap[type] || type; // fallback to the MIME type part if no mapping is found
    }

    return "";
  };

  return (
    <div className="flex flex-wrap">
      {previews.map((url, idx) => {
        const ext = getFileExtension(url);

        const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp"];
        const videoExtensions = ["mp4", "webm", "ogg"];

        if (imageExtensions.includes(ext)) {
          return (
            <Image
              key={idx}
              src={url}
              width={112}
              height={112}
              alt="Preview"
              className="m-2 rounded shadow"
            />
          );
        } else if (videoExtensions.includes(ext)) {
          return (
            <video
              key={idx}
              src={url}
              controls
              className="m-2 w-32 h-32 object-cover rounded shadow"
            />
          );
        } else {
          return (
            <div
              key={idx}
              className="m-2 w-28 h-28 flex items-center justify-center bg-gray-200 rounded shadow"
            >
              <span className="text-gray-600">{ext}</span>
            </div>
          );
        }
      })}
    </div>
  );
};

export default ChatMessagePreviews;
