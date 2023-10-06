import React from "react";
import dynamic from "next/dynamic";
import { GetServerSideProps } from "next";
import { VideoCallChatModel } from "@/db/models/videoCallChatModel";
import Link from "next/link";

const VideoCallPage = dynamic(() => import("@/components/VideoCallPage"), {
  loading: () => <p className="m-4 text-xl">Cargando...</p>,
  ssr: false,
});

const DynamicContextProvider = dynamic(
  () => import("@/context/VideoCallContext").then((mod) => mod.ContextProvider),
  {
    loading: () => <p className="m-4 text-xl">Cargando...</p>,
    ssr: false,
  }
);

const VideoCall = ({ currentCall }: { currentCall: { duration: number } }) => {
  if (!currentCall) {
    return (
      <div className="min-h-screen">
        <p className="p-4 text-lg">
          No hay llamada en proceso, para crear una consulta cliquea{" "}
          <Link
            className="font-bold text-blue-400 underline"
            href="/videocall"
          >
            acá
          </Link>
        </p>
      </div>
    );
  }

  return (
    <DynamicContextProvider
      chatBoxVariant="videochat"
      duration={currentCall.duration}
    >
      <VideoCallPage />
    </DynamicContextProvider>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id: room } = context.query;

  const chat = await VideoCallChatModel.findById(room);

  if (chat && chat.currentCall) {
    const currentTime = new Date().getTime();
    const initTime = new Date(chat.currentCall.initTime).getTime();
    const duration = chat.currentCall.duration;
    const endTime = initTime + duration;
    const timeLeft = endTime - currentTime;

    if (timeLeft <= 0) {
      await VideoCallChatModel.findByIdAndUpdate(room, {
        $set: {
          currentCall: null,
        },
      });

      return {
        props: {
          currentCall: null,
        },
      };
    }

    return {
      props: {
        currentCall: {
          duration: Math.floor(timeLeft),
        },
      },
    };
  }

  return {
    props: {
      currentCall: null,
    },
  };
};

export default VideoCall;
