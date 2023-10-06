import { SocketContext } from "@/context/VideoCallContext";
import React, { useContext } from "react";
import ChatBox from "./ChatBox";
import { faPaperclip } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ChatMessagePreviews from "./ChatMessagePreviews";

const VideoCallChatBox = () => {
  const context = useContext(SocketContext);

  if (!context) {
    throw new Error("You must use this component within a <ContextProvider>");
  }

  const {
    messages,
    message,
    sendMessage,
    setMessage,
    handleUploadImages,
    previews,
    submitBtnDisabled,
    chatBoxVariant,
    fetchNextPage,
    hasNextPage,
  } = context;

  return (
    <div className="flex flex-col">
      <ChatBox
        chatBoxVariant={chatBoxVariant}
        messages={messages}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
      />

      <div className="">
        {previews && <ChatMessagePreviews previews={previews} />}
      </div>

      <form className="flex items-center w-full justify-center">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-grow p-2 border rounded-md focus:outline-none focus:border-blue-500"
        />

        <label
          htmlFor="file"
          className="px-2 flex justify-center items-center ml-2 w-8 h-8 cursor-pointer rounded-full hover:bg-slate-400 transition-all "
        >
          <FontAwesomeIcon
            icon={faPaperclip}
            size="lg"
          />
        </label>

        <input
          name="file"
          accept="*"
          className=""
          type="file"
          id="file"
          multiple
          onChange={handleUploadImages}
          hidden
        />

        <button
          onClick={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          type="submit"
          disabled={submitBtnDisabled}
          className="ml-2 py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none"
        >
          {submitBtnDisabled ? "Cargando..." : "Enviar"}
        </button>
      </form>
    </div>
  );
};

export default VideoCallChatBox;
