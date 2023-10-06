import { ChatMessage } from "@/types";
import React, { useEffect, useRef } from "react";
import ChatMessageFiles from "./ChatMessageFiles";
import {
  FetchNextPageOptions,
  InfiniteQueryObserverResult,
} from "@tanstack/react-query";

const ChatBox = ({
  messages,
  chatBoxVariant = "videochat",
  hasNextPage,
  fetchNextPage,
}: {
  messages: ChatMessage[];
  chatBoxVariant?: "videochat" | "textchat";
  hasNextPage: boolean | undefined;
  fetchNextPage: (
    options?: FetchNextPageOptions | undefined
  ) => Promise<InfiniteQueryObserverResult<any, unknown>>;
}) => {
  const chatBoxRef = useRef<HTMLDivElement>(null);

  const prevMessagesLength = useRef(messages.length);

  useEffect(() => {
    if (chatBoxRef.current && messages.length > prevMessagesLength.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
    prevMessagesLength.current = messages.length;
  }, [messages]);

  return (
    <div
      className={`${
        chatBoxVariant === "videochat" ? "h-52" : "h-[30rem] "
      } overflow-y-auto`}
      ref={chatBoxRef}
    >
      <div className="flex flex-col items-center justify-center px-2">
        {hasNextPage && (
          <button
            onClick={() => fetchNextPage()}
            className="my-2 py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none"
          >
            Cargar mensajes anteriores
          </button>
        )}
        {messages &&
          messages.map((e, i) => {
            const hasFiles = e.files && e.files.length > 0;

            return (
              <div
                key={i}
                className="bg-white w-full"
              >
                <div className="flex items-center">
                  <strong className="text-blue-500 mr-2">{e.user}:</strong>
                  <p>{e.message}</p>
                </div>

                {hasFiles && <ChatMessageFiles files={e.files} />}
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default ChatBox;
