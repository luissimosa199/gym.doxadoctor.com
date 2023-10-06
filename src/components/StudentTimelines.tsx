import { TimelineFormInputs } from "@/types";
import { FunctionComponent } from "react";
import { useQuery } from "@tanstack/react-query";
import TimeLine from "./TimeLine";

interface StudentTimelinesProps {
  userId: string;
}

const StudentTimelines: FunctionComponent<StudentTimelinesProps> = ({
  userId,
}) => {
  const fetchUserTimelines = async () => {
    const response = await fetch(
      `/api/alumnos/timelines/?userId=${userId}&page=0`,
      {
        method: "GET",
      }
    );
    const data = await response.json();
    return data;
  };

  const { data, isLoading, isError } = useQuery(
    ["timelines", userId],
    fetchUserTimelines
  );

  if (isLoading) {
    return (
      <div className="mt-4 bg-white p-6 rounded-lg shadow-md animate-pulse">
        <ul className="divide-y divide-gray-200">
          {[...Array(3)].map((_, index) => (
            <li
              key={index}
              className="py-4 space-y-4"
            >
              <div className="h-4 bg-gray-300 w-1/3"></div>

              <div className="h-6 bg-gray-300 w-2/3 my-2"></div>

              <div className="flex gap-2">
                <div className="w-32 h-32 bg-gray-300 rounded"></div>
                <div className="w-32 h-32 bg-gray-300 rounded"></div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="p-4 bg-gray-300 rounded-lg"></div>
                <div className="p-4 bg-gray-300 rounded-lg"></div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (isError) {
    return <div>Error</div>;
  }

  return (
    <div className="mt-4 bg-white">
      {data && data.length > 0 ? (
        <ul className="divide-y divide-gray-200">
          {data.map((e: TimelineFormInputs) => (
            <li key={e._id || "new_timeline"}>
              <TimeLine
                _id={e._id}
                tags={Array.isArray(e.tags) ? e.tags : [e.tags]}
                mainText={e.mainText}
                length={e.length}
                timeline={e.photo}
                createdAt={e.createdAt}
                authorId={e.authorId}
                authorName={e.authorName}
                links={e.links}
                urlSlug={e.urlSlug}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-500 mt-4">
          No has realizado tu primera publicación
        </p>
      )}
    </div>
  );
};

export default StudentTimelines;
