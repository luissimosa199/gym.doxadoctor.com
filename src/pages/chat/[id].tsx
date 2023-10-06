import ChatOnlyPage from "@/components/ChatOnlyPage";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import React from "react";

const DynamicContextProvider = dynamic(
  () => import("@/context/VideoCallContext").then((mod) => mod.ContextProvider),
  {
    loading: () => <p className="m-4 text-xl">Cargando chat...</p>,
    ssr: false,
  }
);

const ChatPage = () => {
  const router = useRouter();
  const channelName = router.query.id as string;

  if (!router.isReady) {
    return <p className="m-4 min-h-screen text-xl">Registrando sala...</p>;
  }

  return (
    <div className="">
      <DynamicContextProvider chatBoxVariant="textchat">
        <ChatOnlyPage channelName={channelName} />
      </DynamicContextProvider>
    </div>
  );
};

export default ChatPage;
