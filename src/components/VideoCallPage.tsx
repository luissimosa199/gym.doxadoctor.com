import { useState, useEffect, useRef, useContext } from "react";
import {
  ClientConfig,
  IAgoraRTCRemoteUser,
  createClient,
  createMicrophoneAndCameraTracks,
} from "agora-rtc-react";
import { useRouter } from "next/router";
import { SocketContext } from "@/context/VideoCallContext";
import VideoCallChatBox from "./VideoCallChatBox";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons";

const config = {
  mode: "rtc",
  codec: "vp8",
  appid: "c2a17faedf124435a895dab019e37429",
};

const useClient = createClient(config as ClientConfig);
const useMicrophoneAndCameraTracks = createMicrophoneAndCameraTracks();

const VideoCallPage = () => {
  const router = useRouter();
  const { id: channelName } = router.query;

  const [inCall, setInCall] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const [isClientReady, setIsClientReady] = useState(false);

  const client = useClient();
  const { ready, tracks } = useMicrophoneAndCameraTracks();

  const localVideoRef = useRef<HTMLDivElement>(null);

  const context = useContext(SocketContext);

  if (!context) {
    throw new Error("You must use this component within a <ContextProvider>");
  }

  const { usersInRoom, setRoomName, roomName, duration } = context;

  useEffect(() => {
    setRoomName(channelName as string);
    if (ready && tracks && !isClientReady) {
      client.join(config.appid, channelName as string, null).then((uid) => {
        client.publish(tracks);
        setInCall(true);
        setIsClientReady(true); // Set the client as ready after joining
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, tracks, ready, isClientReady, channelName]);

  // This useEffect handles the local video track
  useEffect(() => {
    if (tracks && localVideoRef.current) {
      tracks[1].play(localVideoRef.current);
      return () => {
        tracks[1].stop();
        tracks[1].close();
      };
    }
  }, [tracks]);

  // This useEffect handles user-published events and other client events
  useEffect(() => {
    const handleUserPublished = async (
      user: IAgoraRTCRemoteUser,
      mediaType: "video" | "audio"
    ) => {
      await client.subscribe(user, mediaType);
      if (mediaType === "video" && user.videoTrack) {
        setRemoteUsers((prevUsers) => [...prevUsers, user]);
        user.videoTrack.play(`video-${user.uid}`);
      }
      if (mediaType === "audio" && user.audioTrack) {
        user.audioTrack.play();
      }
    };

    const handleUserUnpublished = (user: IAgoraRTCRemoteUser) => {
      setRemoteUsers((prevUsers) =>
        prevUsers.filter((u) => u.uid !== user.uid)
      );
    };

    client.on("user-published", handleUserPublished);
    client.on("user-unpublished", handleUserUnpublished);

    return () => {
      client.off("user-published", handleUserPublished);
      client.off("user-unpublished", handleUserUnpublished);
    };
  }, [client]);

  // This useEffect handles client disconnection
  useEffect(() => {
    const handleClientDisconnected = () => {
      setIsClientReady(false);
    };
    client.on("disconnected", handleClientDisconnected);
    return () => {
      client.off("disconnected", handleClientDisconnected);
    };
  }, [client]);

  useEffect(() => {
    remoteUsers.forEach((user) => {
      if (user.videoTrack) {
        user.videoTrack.play(`video-${user.uid}`);
      }
    });
  }, [remoteUsers]);

  useEffect(() => {
    const timer = setTimeout(() => {
      alert(`llamada finalizada, duración: ${duration}`);
      router.push("/");
    }, duration);

    return () => {
      clearTimeout(timer);

      if (tracks) {
        client.unpublish(tracks);
      }

      client.leave().catch((err) => {
        console.error("Failed to leave the call", err);
      });

      if (tracks) {
        tracks.forEach((track) => {
          track.stop();
          track.close();
        });
      }

      client.removeAllListeners();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full min-h-[95vh] grid grid-rows-3 grid-cols-5 gap-2 relative">
      <div className="bg-slate-300 h-full col-span-5 row-span-2 flex justify-center gap-1">
        {/* Remote Streams */}
        {remoteUsers.map((user) => (
          <div
            key={user.uid}
            id={`video-${user.uid}`}
            className="h-full w-2/3 md:w-96 rounded-md"
          ></div>
        ))}
      </div>

      <div className="col-span-5 sm:col-span-4 flex mb-2">
        <div className="w-full h-full p-2 rounded-md flex flex-col justify-between ">
          {/* Chat Display */}
          <div className="rounded p-2 sticky top-0 bg-slate-200 flex gap-2 z-20 justify-between text-xs sm:text-base">
            <div className="hidden  md:flex gap-2">
              {usersInRoom.map(({ name }, index) => (
                <div
                  key={index}
                  className=""
                >
                  <strong className="text-blue-500">{name}</strong>
                </div>
              ))}
            </div>
            <div>
              {roomName && (
                <div className="flex">
                  <p>
                    Comparte este link:{" "}
                    {`${process.env.NEXT_PUBLIC_BASE_URL}/videocall/${roomName}`}
                  </p>
                  <button
                    className="ml-2"
                    onClick={(e) => {
                      e.preventDefault();
                      navigator.clipboard.writeText(
                        `${process.env.NEXT_PUBLIC_BASE_URL}/videocall/${roomName}`
                      );
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faCopy}
                      className="text-slate-500"
                    />
                  </button>
                </div>
              )}
            </div>
          </div>
          <VideoCallChatBox />
        </div>
      </div>

      {/* Local Stream */}
      <div className="w-24 h-24 row-start-1 col-start-5 absolute right-0 top-0 sm:w-full sm:h-full sm:static sm:row-start-3">
        <div
          ref={localVideoRef}
          className="w-full h-full"
        ></div>
      </div>
    </div>
  );
};

export default VideoCallPage;
