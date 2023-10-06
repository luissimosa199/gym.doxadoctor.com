import {
  faPenToSquare,
  faVideoCamera,
  faMessage,
  faBoxArchive,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import router from "next/router";
import React, { FunctionComponent } from "react";
import { Session } from "next-auth";
import { CldImage } from "next-cloudinary";
import { noProfileImage } from "@/utils/noProfileImage";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Student } from "@/types";

interface UserInterface {
  alumno: {
    name: string;
    email: string;
    image: string;
    _id: string;
    isArchived: boolean;
  };
  session: Session | null;
}

const StudentCard: FunctionComponent<UserInterface> = ({ alumno, session }) => {
  const queryClient = useQueryClient();

  const handleArchiveStudents = async (id: string) => {
    const response = await fetch(`/api/alumnos?id=${id}`, {
      method: "PATCH",
    });

    const data = await response.json();
    return data;
  };

  const archiveMutation = useMutation(handleArchiveStudents, {
    onMutate: (studentId) => {
      // Backup the current students list
      const previousStudents = queryClient.getQueryData(["alumnos"]);

      // Optimistically update the cache
      queryClient.setQueryData(
        ["alumnos"],
        (current: Student[] | undefined) => {
          return current?.map((student) => {
            if (student._id === studentId) {
              // Check if isArchived exists and toggle, if not, set it to true
              return {
                ...student,
                isArchived: student.hasOwnProperty("isArchived")
                  ? !student.isArchived
                  : true,
              };
            }
            return student;
          });
        }
      );

      // Return the previous students list to rollback on error
      return { previousStudents };
    },
    onError: (err, studentId, context: any) => {
      // If the mutation fails, roll back to the previous state
      if (context?.previousStudents) {
        queryClient.setQueryData(["alumnos"], context.previousStudents);
      }
    },
  });

  return (
    <li
      key={alumno._id}
      className="py-4 space-y-4"
    >
      <div className="flex items-center gap-4">
        <div className="rounded-full h-[50px] min-w-[50px] border-2 overflow-hidden relative">
          <Link href={`/alumnos/${alumno._id}`}>
            <CldImage
              alt={`foto de ${alumno.name}`}
              src={alumno.image || noProfileImage}
              fill
              className="absolute object-cover"
            />
          </Link>
        </div>
        <Link href={`/alumnos/${alumno._id}`}>
          <div className="flex flex-col">
            <p className="text-lg font-medium">{alumno.name}</p>
            {alumno.isArchived && (
              <p className="text-sm text-slate-400 font-medium">(archivado)</p>
            )}
          </div>
        </Link>

        <div className="ml-auto flex gap-2">
          {session?.user && (
            <button
              className="hover:text-green-500 transition"
              onClick={(e) => {
                e.preventDefault();
                router.push(
                  `/chat/${(session?.user?.email as string).split("@")[0]}y${
                    alumno.name
                  }`
                );
              }}
            >
              <FontAwesomeIcon
                size="lg"
                icon={faMessage}
              />
            </button>
          )}

          {session?.user && (
            <button
              className="hover:text-blue-500 transition"
              onClick={(e) => {
                e.preventDefault();
                router.push(`/videocall?name=${alumno.name}`);
              }}
            >
              <FontAwesomeIcon
                size="lg"
                icon={faVideoCamera}
              />
            </button>
          )}

          <button
            className="hover:text-blue-500 transition"
            onClick={(e) => {
              e.preventDefault();
              router.push(`/alumnos/edit/${alumno._id}`);
            }}
          >
            <FontAwesomeIcon
              icon={faPenToSquare}
              size="lg"
            />
          </button>

          <button
            className="hover:text-yellow-500 transition"
            onClick={(e) => {
              e.preventDefault();
              archiveMutation.mutate(alumno._id);
            }}
          >
            <FontAwesomeIcon
              icon={faBoxArchive}
              size="lg"
            />
          </button>
        </div>
      </div>
    </li>
  );
};

export default StudentCard;
