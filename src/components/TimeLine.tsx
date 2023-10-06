import { FunctionComponent } from "react";
import TimeLineEntry from "./TimeLineEntry";
import { InputItem, TimeLineEntryData, TimeLineProps } from "@/types";
import Head from "next/head";
import ShareButtons from "./ShareButtons";
import HeadMetaTags from "./HeadMetaTags";
import formatDateString from "@/utils/formatDateString";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Swal from "sweetalert2";
import { useQueryClient } from "@tanstack/react-query";
import IFrame from "./Iframe";
import { isYtUrl, extractVideoId, extractTimestamp } from "@/utils/isYtUrl";
import YouTubePlayer from "./YoutubePlayer";
import React from "react";
import Ad from "./Ad";

const TimeLine: FunctionComponent<TimeLineProps> = ({
  timeline,
  length,
  mainText,
  createdAt,
  tags,
  _id,
  authorId,
  authorName,
  links,
  urlSlug,
}) => {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const handleDeleteTimeline = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();

    try {
      const willDelete = await Swal.fire({
        title: "Estas seguro?",
        text: "Esta publicación no podrá ser recuperada una vez confirmes",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Borrar",
        cancelButtonText: "Volver",
        reverseButtons: true,
      });

      if (willDelete.isConfirmed) {
        const response = await fetch(
          `/api/timeline/${_id}${
            session?.user?.name !== authorId ? "?username=" + authorId : ""
          }`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          const data = await response.json();
          const prevData = queryClient.getQueryData(["timelines", authorId]);
          queryClient.invalidateQueries(["timelines", authorId]);

          Swal.fire({
            title: "Publicación borrada",
            icon: "success",
          });
        } else {
          Swal.fire({
            title: `Error: ${response.status} ${response.statusText}`,
            icon: "error",
          });
        }
      }
    } catch (error) {
      console.error("Error: ", error);

      Swal.fire({
        title: `Error: ${JSON.stringify(error)}`,
        icon: "error",
      });
    }
  };

  const timeLineUrl = BASE_URL + `/nota/${urlSlug ? urlSlug : _id}`;

  return (
    <div className="mb-4 max-w-[850px] mx-auto">
      <Head>
        <HeadMetaTags
          timeline={timeline}
          timelineName={mainText?.slice(0, 50) || ""}
          timeLineUrl={timeLineUrl}
          message=""
          siteName=""
        />
      </Head>
      <div className="bg-white shadow-md rounded-lg py-4">
        <div className="">
          <Ad />
        </div>
        <div className="px-4">
          <div className="text-left">
            {mainText &&
              mainText.split("\n").map((paragraph, idx) => (
                <p
                  key={idx}
                  className={
                    mainText.length > 300
                      ? "text-md font-normal mb-2"
                      : "text-xl font-semibold mb-2"
                  }
                >
                  {paragraph}
                </p>
              ))}
          </div>
          <p className="text-gray-500 mt-2 text-xs font-medium tracking-wider text-left uppercase ">
            {tags.map((e: string, idx: number) => {
              return (
                <React.Fragment key={idx}>
                  <Link
                    href={`/nota/search?tags=${e}`}
                    className="cursor-pointer hover:underline"
                  >
                    {e}
                  </Link>
                  {idx + 1 !== tags.length && ","}{" "}
                </React.Fragment>
              );
            })}
          </p>
          <p className="text-sm text-gray-500">{formatDateString(createdAt)}</p>
          <p className="text-sm text-gray-500 capitalize">
            {authorName === "defaultName" ? "" : authorName}
          </p>
          <div className="mt-4 flex justify-between items-center">
            {/* <div>
              {_id !== "newitem" && <ShareButtons url={timeLineUrl} title={`${mainText?.slice(0, 50)}`} />}
            </div> */}
            <div className="w-full flex justify-end gap-2">
              {_id !== "newitem" && (
                <>
                  <Link
                    className="text-blue-500 w-6 h-6 hover:text-blue-700 transition ease-in-out duration-150"
                    href={`/nota/editar/${_id}${
                      session?.user?.name !== authorId
                        ? "?username=" + encodeURIComponent(authorId)
                        : ""
                    }`}
                  >
                    <FontAwesomeIcon
                      icon={faPenToSquare}
                      size="lg"
                    />
                  </Link>
                  <button
                    className="w-5 h-5"
                    onClick={handleDeleteTimeline}
                  >
                    <FontAwesomeIcon
                      icon={faTrashCan}
                      size="lg"
                      className="text-red-500 hover:text-red-700 transition ease-in-out duration-150"
                    />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="mt-6 ">
          {timeline &&
            timeline.map((e: TimeLineEntryData) => (
              <TimeLineEntry
                key={e.idx}
                idx={e.idx}
                data={e}
                length={length}
              />
            ))}

          {links &&
            links.length > 0 &&
            links.map((e: string | InputItem, idx: number) => {
              let src: string;
              let caption: string | undefined;

              if (typeof e === "object" && e.value) {
                src = e.value;
                caption = e.caption;
              } else if (typeof e === "string") {
                src = e;
                caption = undefined;
              } else {
                return null;
              }

              if (isYtUrl(src) && extractVideoId(src)) {
                const start = extractTimestamp(src);

                return (
                  <div
                    key={src + _id}
                    className="mt-4 max-w-[800px] w-full mx-auto bg-white"
                  >
                    <div className="">
                      <YouTubePlayer
                        videoId={extractVideoId(src) as string}
                        h="500px"
                        start={start}
                      />
                      {caption && (
                        <p className="text-lg text-gray-500 mt-2 ml-2">
                          {caption}
                        </p>
                      )}
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={src + _id}
                  className="mt-4 max-w-[800px] w-full mx-auto bg-white"
                >
                  <div className="">
                    <IFrame
                      src={src}
                      h="800px"
                    />
                    {caption && (
                      <p className="text-lg text-gray-500 mt-2 ml-2">
                        {caption}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default TimeLine;
