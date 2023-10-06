import { useSession } from "next-auth/react";
import { CldImage } from "next-cloudinary";
import React, { FunctionComponent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";

interface UserPhotosProps {
  username?: string;
  userId?: string;
  direction?: "flex-col" | "flex-row";
  queryKey?: string[];
}

const UserPhotos: FunctionComponent<UserPhotosProps> = ({
  username,
  userId,
  direction = "flex-col",
  queryKey = [username, "userPhotos"],
}) => {
  const { data: session } = useSession();
  const router = useRouter();
  const studentPicture = router.asPath.startsWith("/alumnos/");

  const fetchUserPhotos = async () => {
    const response = await fetch(
      `/api/${studentPicture ? "alumnos" : "user"}/photos/?${
        studentPicture
          ? `userId=${userId}`
          : `username=${encodeURIComponent(username as string)}`
      }`,
      {
        method: "GET",
      }
    );
    const data = await response.json();
    return data;
  };

  const deleteUserPhoto = async (photoUrl: string) => {
    const response = await fetch(
      `/api/${studentPicture ? "alumnos" : "user"}/photos/?${
        studentPicture
          ? `userId=${userId}`
          : `username=${encodeURIComponent(username as string)}`
      }`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ photo: photoUrl }),
      }
    );
    const data = await response.json();
    return data;
  };

  const handleDelete = (e: string): void => {
    queryClient.cancelQueries(queryKey);
    mutation.mutate(e);
  };

  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery(queryKey, fetchUserPhotos);

  const mutation = useMutation(
    async (photoUrl: string) => {
      return deleteUserPhoto(photoUrl);
    },
    {
      onMutate: (photoUrl: string) => {
        const previousData = queryClient.getQueryData<string[]>(queryKey);
        if (previousData) {
          queryClient.setQueryData(queryKey, (oldData = []) => {
            return (oldData as string[]).filter(
              (photo: string) => photo !== photoUrl
            );
          });
        }
        return { previousData };
      },
      onError: (err: any, photoUrl: string, context: any) => {
        queryClient.setQueryData(queryKey, context.previousData);
      },
    }
  );

  if (isLoading) {
    return (
      <>
        <div className="flex flex-col gap-2 items-center container overflow-x-auto py-12 px-2 mb-4">
          {Array(5)
            .fill(null)
            .map((_, idx) => (
              <div
                key={idx}
                className="relative w-fit flex-shrink-0"
              >
                <div className="w-6 h-6 absolute top-0 right-0 bg-gray-300 p-1 rounded-full"></div>
                <div className="w-[700px] h-[700px] bg-gray-200 rounded mx-auto"></div>
              </div>
            ))}
        </div>
      </>
    );
  }

  if (isError) {
    return <div>Error</div>;
  }

  return (
    <>
      <div
        className={`flex ${direction} gap-2 items-center container space-x-2 md:space-x-4 overflow-x-auto py-12 px-2 whitespace-nowrap mb-4`}
      >
        {data && data.length > 0 ? (
          data.map((e: string) => {
            const isVideo =
              e.includes("/dahu3rii0/video/upload/") && e.endsWith(".mp4");

            return (
              <div
                key={e}
                className="relative inline-block w-fit flex-shrink-0"
              >
                {session && (
                  <button
                    onClick={() => {
                      handleDelete(e);
                    }}
                    className="w-6 h-6 flex justify-center items-center md:h-8 md:w-8 absolute top-0 right-0 bg-gray-300 text-gray-700 p-1 rounded-full hover:bg-gray-400 transition duration-300 z-10"
                  >
                    X
                  </button>
                )}

                {isVideo ? (
                  <video
                    controls
                    width="700"
                    height="700"
                    className="rounded mx-auto"
                  >
                    <source
                      src={e}
                      type="video/mp4"
                    />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <CldImage
                    alt=""
                    src={e}
                    width={700}
                    height={700}
                    className="object-cover rounded-md shadow"
                  />
                )}
              </div>
            );
          })
        ) : (
          <p className="text-gray-600 italic">No hay fotos para mostrar</p>
        )}
      </div>
    </>
  );
};

export default UserPhotos;
