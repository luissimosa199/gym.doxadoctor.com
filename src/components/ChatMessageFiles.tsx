import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CldImage } from "next-cloudinary";
import React from "react";

const ChatMessageFiles = ({
  files,
}: {
  files: { url: string; type: string }[] | undefined;
}) => {
  async function downloadFileFromCloudinary(
    url: string,
    filename = "downloadedFile"
  ) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const href = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = href;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading the file:", error);
    }
  }

  const extractFileName = (url: string) => {
    const regex = /([^/_]+)(?=_[^/]+$)/;
    const match = url.match(regex);
    return match ? match[1] : "defaultName"; // defaultName is a fallback in case the regex doesn't match
  };

  return (
    <div className="mt-2 flex gap-2 bg-slate-200 p-2 rounded">
      {files?.map((file, index) => {
        if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(file.type)) {
          // Render image tag for image types
          return (
            <button
              onClick={() =>
                downloadFileFromCloudinary(
                  file.url,
                  `imagen_${index}.${file.type}`
                )
              }
              key={index}
            >
              <CldImage
                src={file.url}
                width={500}
                height={500}
                alt={`File ${index}`}
                className="rounded shadow-md hover:scale-110 hover:shadow-lg transition-all"
              />
            </button>
          );
        } else if (
          ["mp4", "mpeg", "ogv", "webm", "3gp", "3g2"].includes(file.type)
        ) {
          // Render video tag for video types
          return (
            <video
              key={index}
              src={file.url}
              controls
              className="rounded shadow-md"
            />
          );
        } else if (file.type === "pdf") {
          // Render iframe for PDF files
          return (
            <iframe
              key={index}
              src={file.url}
              width="500"
              height="500"
              className="rounded shadow-md"
              title={`PDF File ${index}`}
            />
          );
        } else {
          // Render the button for all other file types
          return (
            <div
              className="flex flex-col items-center bg-white w-fit rounded shadow-md hover:scale-110 hover:shadow-lg transition-all"
              key={index}
            >
              <button
                onClick={() =>
                  downloadFileFromCloudinary(
                    file.url,
                    `${extractFileName(file.url)}.${file.type}`
                  )
                }
              >
                <p className="text-sm px-2">{extractFileName(file.url)}</p>
                <p className="text-black p-1 text-center uppercase">
                  {file.type}
                </p>
                <FontAwesomeIcon
                  icon={faDownload}
                  size="xs"
                />
              </button>
            </div>
          );
        }
      })}
    </div>
  );
};

export default ChatMessageFiles;
