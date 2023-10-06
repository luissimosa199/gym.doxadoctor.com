import { useSession } from "next-auth/react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import StudentCard from "@/components/StudentCard";
import { useState } from "react";
import StudentFilters from "@/components/StudentsFilters";
import { Student } from "@/db/models/studentModel";

interface UserInterface {
  name: string;
  email: string;
  image: string;
  _id: string;
  tags: string[];
  isArchived: boolean;
}

const Usuarios = () => {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [nameFilter, setNameFilter] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const fetchStudents = async () => {
    const response = await fetch("/api/alumnos", {
      method: "GET",
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = response.json();
    return data;
  };

  const {
    data: alumnos,
    error,
    isLoading,
  } = useQuery(["alumnos"], fetchStudents);

  if (status === "unauthenticated") {
    router.push("/login");
  }

  if (isLoading)
    return (
      <div className="mt-4 min-h-screen bg-white p-6 rounded-lg shadow-md animate-pulse">
        <ul className="divide-y divide-gray-200">
          {[...Array(6)].map((_, index) => (
            <li
              key={index}
              className="py-4 space-y-4"
            >
              <div className="flex items-center gap-4">
                {/* Skeleton for profile image */}
                <div className="rounded-full h-[150px] w-[150px] bg-gray-300"></div>
                {/* Skeleton for user name */}
                <div className="flex flex-col">
                  <div className="h-6 bg-gray-300 w-1/2 rounded"></div>
                </div>
                {/* Skeleton for video call icon */}
                <div className="h-6 w-6 bg-gray-300 rounded ml-4"></div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );

  if (error) return <p>Error {JSON.stringify(error)} </p>;

  const tags = Array.from(
    new Set(alumnos.flatMap((e: UserInterface) => e.tags))
  ) as string[];

  const filteredStudents = alumnos
    .filter((alumno: Student) => {
      // If no filters are applied, take archived status into account
      if (!nameFilter && selectedTags.length === 0) {
        if (showArchived) {
          return alumno.isArchived === true;
        } else {
          return alumno.isArchived !== true; // handles both undefined and false cases
        }
      }
      return true; // If any filter is applied, we don't filter out by archived status here.
    })
    .filter((alumno: UserInterface) => {
      // Handle name filtering
      return nameFilter
        ? alumno.name.toLowerCase().includes(nameFilter.toLowerCase())
        : true;
    })
    .filter((alumno: UserInterface) => {
      // Handle tag filtering
      return selectedTags.length > 0
        ? selectedTags.every((tag) => alumno.tags.includes(tag))
        : true;
    })
    .sort((a: Student, b: Student) => {
      // If 'a' is archived and 'b' is not, 'a' comes last
      if (a.isArchived && !b.isArchived) return 1;
      // If 'b' is archived and 'a' is not, 'b' comes last
      if (b.isArchived && !a.isArchived) return -1;
      // Otherwise, no change in order
      return 0;
    });

  return (
    <div className="mt-4 bg-white p-6 rounded-lg shadow-md min-h-screen max-w-[850px] mx-auto">
      <div className="flex flex-col">
        <StudentFilters
          tags={tags}
          setSelectedTags={setSelectedTags}
        />

        <div className="flex justify-between">
          <Link
            className="w-fit inline-flex items-center p-4 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:border-blue-700 focus:shadow-outline-blue active:bg-blue-800 transition ease-in-out duration-150"
            href="/alumnos/register"
          >
            Nuevo alumno
          </Link>

          <button
            className="w-fit inline-flex items-center p-4 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-500 focus:outline-none focus:border-green-700 focus:shadow-outline-green active:bg-green-800 transition ease-in-out duration-150"
            onClick={() => setShowArchived(!showArchived)}
          >
            {showArchived ? "Alumnos activos" : "Alumnos archivados"}
          </button>
        </div>
        <input
          type="text"
          placeholder="Buscar por nombre..."
          className="p-2 mt-4 border rounded"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
        />
      </div>

      <ul className="divide-y divide-gray-200">
        {alumnos.length === 0 && (
          <li className="py-4 space-y-4">
            <div className="flex items-center gap-4">
              <p>No has registrado alumnos</p>
            </div>
          </li>
        )}

        {filteredStudents.map((alumno: UserInterface, idx: number) => {
          return (
            <StudentCard
              key={idx}
              session={session}
              alumno={alumno}
            />
          );
        })}
      </ul>
    </div>
  );
};

export default Usuarios;
