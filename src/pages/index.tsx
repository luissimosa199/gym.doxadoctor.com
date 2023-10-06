import TimeLine from "@/components/TimeLine";
import UserCard from "@/components/UserCard";
import dbConnect from "@/db/dbConnect";
import { TimeLineModel } from "@/db/models";
import { TimelineFormInputs } from "@/types";
import { GetServerSideProps } from "next";
import { ChangeEvent, FunctionComponent, useEffect, useState } from "react";
import { debounce } from "lodash";
import TimelineForm from "@/components/TimelineForm";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getTimelines } from "@/utils/getTimelines";
import CategoriesList from "@/components/CategoriesList";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { authOptions } from "./api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import ProfileButtonsPanel from "@/components/ProfileButtonsPanel";

interface MainboardProps {
  timelineData: TimelineFormInputs[];
}

const Mainboard: FunctionComponent = () => {
  const [searchValue, setSearchValue] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<TimelineFormInputs[] | null>(
    null
  );

  const router = useRouter();
  const { data: session, status } = useSession();

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<TimelineFormInputs[]>(
    ["timelines", session?.user?.email],
    ({ pageParam = 0 }) => getTimelines("timelines", pageParam),
    {
      getNextPageParam: (lastPage: [], allPages: []) => {
        if (lastPage.length === 0) return undefined;
        return allPages.length;
      },
    } as any
  );

  const debouncedHandleSearchBar = debounce((value: string) => {
    setSearchValue(value);
  }, 300);

  const handleSearchBar = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    debouncedHandleSearchBar(event.target.value);
  };

  const handleSearch = async (value: string) => {
    const url = new URL("/api/timeline", window.location.origin);

    const valuesArray = value.split(" ");

    if (valuesArray.length > 1) {
      valuesArray.map((e) => url.searchParams.append("tags", e));
    } else {
      url.searchParams.append("tags", value);
    }

    const response = await fetch(url, {
      method: "GET",
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      throw new Error("Failed to fetch data");
    }
  };

  useEffect(() => {
    (async () => {
      if (searchValue) {
        try {
          const response = await handleSearch(searchValue);
          setSearchResult(response as TimelineFormInputs[]);
        } catch (error) {
          console.error(error);
        }
      }
    })();
  }, [searchValue]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <>
      <div className="text-center">
        <ProfileButtonsPanel />
      </div>

      <div className="text-center max-w-[850px] mx-auto flex flex-col mb-4">
        <input
          placeholder="Buscar por categoría"
          className="border rounded p-2 mb-4"
          type="text"
          onChange={handleSearchBar}
        />
        <CategoriesList />
      </div>
      <TimelineForm />

      <div className="mt-4">
        {isError && <p>Error: {JSON.stringify(error)} </p>}

        {searchValue &&
        Array.isArray(searchResult) &&
        searchResult.length > 0 ? (
          searchResult.map((e) => (
            <div key={e._id}>
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
            </div>
          ))
        ) : searchValue &&
          Array.isArray(searchResult) &&
          searchResult.length === 0 ? (
          <p className="text-center text-lg font-bold mt-4">
            No hay resultados
          </p>
        ) : (
          <>
            {data?.pages.map((page: TimelineFormInputs[]) =>
              page.map((e) => (
                <div key={e._id}>
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
                </div>
              ))
            )}
            {isLoading && (
              <p className="w-full bg-slate-100 py-4 text-center">
                Cargando...
              </p>
            )}
            {isError && <p>Error: {JSON.stringify(error)}</p>}
            {data && isFetchingNextPage && (
              <p className="w-full bg-slate-100 py-4 text-center">
                Cargando...
              </p>
            )}
            {data && hasNextPage && !isFetchingNextPage && (
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="w-full bg-slate-100 py-4 "
              >
                Ver más
              </button>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Mainboard;

export const getServerSideProps: GetServerSideProps<MainboardProps> = async (
  context
) => {
  try {
    const session = await getServerSession(
      context.req,
      context.res,
      authOptions
    );

    if (!session || !session.user) {
      return {
        redirect: {
          destination: "/login",
          permanent: false,
        },
      };
    }

    await dbConnect();

    const response = await TimeLineModel.find({ authorId: session.user.email })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const timelineData = response.map((item) => ({
      _id: item._id,
      urlSlug: item.urlSlug || "",
      mainText: item.mainText,
      length: item.length,
      photo: item.photo,
      createdAt: item.createdAt.toISOString(),
      tags: item.tags || [],
      authorId: item.authorId || "",
      authorName: item.authorName || "",
      links: item.links,
    }));

    return {
      props: {
        timelineData,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      props: {
        timelineData: [],
      },
    };
  }
};
