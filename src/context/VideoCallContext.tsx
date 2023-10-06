import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  ChangeEvent,
} from "react";
import { Socket, io } from "socket.io-client";
import { useSession } from "next-auth/react";
import {
  ChatMessage,
  ContextProviderProps,
  SocketContextType,
  UserInRoom,
} from "@/types";
import { saveChat } from "@/utils/saveChat";
import { handleNewFileChange, uploadImages } from "@/utils/formHelpers";
import { useInfiniteQuery } from "@tanstack/react-query";

const SocketContext = createContext<SocketContextType | undefined>(undefined);

const ContextProvider: React.FC<ContextProviderProps> = ({
  duration,
  chatBoxVariant,
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  if (!socket) {
    console.log("route not found");
    const newSocket = io();
    setSocket(newSocket);
  }

  const { data: session, status } = useSession();

  const [name, setName] = useState<string>("");
  const [usersInRoom, setUsersInRoom] = useState<UserInRoom[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState<string>("");
  const [roomName, setRoomName] = useState<string | null>(null);
  const [chatLoaded, setChatLoaded] = useState<boolean>(false);

  const [files, setFiles] = useState<string[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitBtnDisabled, setSubmitBtnDisabled] = useState<boolean>(false);

  const fetchChatMessages = async ({ pageParam }: { pageParam?: string }) => {
    const beforeTimestamp = pageParam ? pageParam : "";

    if (!roomName) {
      return;
    }

    const response = await fetch(
      `/api/chat/${roomName}?beforeTimestamp=${beforeTimestamp}`,
      {
        method: "GET",
      }
    );

    return response.json();
  };

  const { fetchNextPage, hasNextPage } = useInfiniteQuery(
    ["chatMessages", roomName],
    fetchChatMessages,
    {
      getNextPageParam: (lastPage) => {
        if (!lastPage) {
          return false;
        }

        return lastPage.oldestTimestamp
          ? new Date(lastPage.oldestTimestamp).getTime().toString()
          : false;
      },
      onSuccess(data) {
        const fetchedMessages = data.pages
          .filter((page) => page && Array.isArray(page.messages))
          .flatMap((page) => page.messages);

        setMessages((prevMessages) => {
          // Convert existing timestamps to Unix timestamps in milliseconds for quick lookup
          const existingTimestamps = new Set(
            prevMessages
              .filter((msg) => msg.timestamp !== undefined)
              .map((msg) => {
                // Check if timestamp is already in Unix format or ISO string format
                return typeof msg.timestamp === "number"
                  ? msg.timestamp
                  : new Date(msg.timestamp!).getTime();
              })
          );

          // Filter out any fetched messages that already exist based on their timestamp
          const uniqueFetchedMessages = fetchedMessages
            .map((msg) => ({
              ...msg,
              timestamp: new Date(msg.timestamp).getTime(),
            }))
            .filter((msg) => !existingTimestamps.has(msg.timestamp));

          return [...uniqueFetchedMessages, ...prevMessages];
        });
      },
      staleTime: 1000 * 60 * 60,
      refetchInterval: false,
    }
  );

  useEffect(() => {
    if (socket) {
      // Set up the event listeners
      socket.on("usersInRoom", (usersInRoom) => {
        setUsersInRoom(usersInRoom);
      });

      socket.on("roomMessages", (roomMessages) => {
        setMessages((prevMessages) => {
          // Create a set of existing timestamps for quick lookup
          const existingTimestamps = new Set(
            prevMessages.map((msg) => msg.timestamp)
          );

          // Filter out any roomMessages that already exist based on their timestamp
          const uniqueRoomMessages = roomMessages.filter(
            (msg: ChatMessage) => !existingTimestamps.has(msg.timestamp)
          );

          return [...prevMessages, ...uniqueRoomMessages];
        });
      });

      if (roomName && status !== "loading") {
        const roomToJoin = roomName;
        const userName = session?.user?.name || "Invitado";
        socket.emit("joinRoomOnConnect", roomToJoin, userName, () => {
          console.log(`Joined the room: ${roomToJoin}`);
        });

        const chatContent = {
          timestamp: new Date(),
          room: roomName,
          message: `${userName} se ha conectado al chat`,
          user: "ChatBot",
        };

        socket.emit("sendMessage", chatContent);
        saveChat({ room: roomName, newMessage: chatContent });
        setChatLoaded(true);
      }
    }

    return () => {
      if (socket) {
        socket.off("usersInRoom");
        socket.off("roomMessages");
        setChatLoaded(false);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomName, status]);

  useEffect(() => {
    if (session && session.user) {
      setName(session?.user?.name as string);
    } else {
      setName("Invitado");
    }
  }, [session]);

  useEffect(() => {
    // Check if there are any files in the state
    if (files.length > 0) {
      sendMessage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  const sendMessage = useCallback(() => {
    let chatContent: ChatMessage = {
      timestamp: new Date(),
      room: roomName as string,
      user: name,
      message: message,
      files: files.map((e) => {
        return { url: e, type: e.slice(-3) };
      }),
    };

    if (
      socket &&
      (chatContent.message?.trim() !== "" ||
        (chatContent.files && chatContent.files.length > 0))
    ) {
      socket.emit("sendMessage", chatContent);

      if (roomName) {
        saveChat({ room: roomName, newMessage: chatContent });
      }

      setMessage("");
      setFiles([]);
      setPreviews([]);
    }
  }, [name, files, message, socket, roomName]);

  const handleUploadImages = async (event: ChangeEvent<HTMLInputElement>) => {
    setSubmitBtnDisabled(true);
    const newPreviews = await handleNewFileChange(event);
    setPreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);

    try {
      const uploadedUrls = await uploadImages(event);
      // If you want to set the URLs to some state
      setFiles((prevFiles) => [...prevFiles, ...(uploadedUrls as string[])]);
    } catch (error) {
      console.error("Error uploading images:", error);
    }

    setSubmitBtnDisabled(false);
    event.target.value = "";
  };

  return (
    <SocketContext.Provider
      value={{
        name,
        setName,
        usersInRoom,
        fetchNextPage,
        hasNextPage,
        messages,
        status,
        sendMessage,
        message,
        setMessage,
        setRoomName,
        roomName,
        chatLoaded,
        duration,
        handleUploadImages,
        files,
        previews,
        submitBtnDisabled,
        chatBoxVariant,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export { ContextProvider, SocketContext };
