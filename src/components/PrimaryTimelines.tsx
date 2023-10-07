import { TimelineFormInputs } from "@/types";
import { getTimelines } from "@/utils/getTimelines";
import { useInfiniteQuery } from "@tanstack/react-query";
import React, {
  ChangeEvent,
  FunctionComponent,
  useEffect,
  useState,
} from "react";
import TimeLine from "./TimeLine";
import { debounce } from "lodash";

interface PrimaryTimelinesProps {
  email: string;
}

const PrimaryTimelines: FunctionComponent<PrimaryTimelinesProps> = ({
  email,
}) => {
  const [searchValue, setSearchValue] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<TimelineFormInputs[] | null>(
    null
  );

  const debouncedHandleSearchBar = debounce((value: string): void => {
    setSearchValue(value);
  }, 300);

  const handleSearchBar = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    debouncedHandleSearchBar(event.target.value);
  };

  const handleSearch = async (value: string) => {
    const url = new URL(
      `/api/timeline?username=${email}`,
      window.location.origin
    );

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

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<TimelineFormInputs[]>(
    ["timelines", email],
    ({ pageParam = 0 }) => getTimelines("timelines", pageParam, email),
    {
      getNextPageParam: (lastPage: [], allPages: []) => {
        if (lastPage.length === 0) return undefined;
        return allPages.length;
      },
    } as any
  );

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

  return (
    <div className="mt-4">
      <div className="text-center max-w-[850px] mx-auto flex flex-col mb-4">
        <input
          placeholder="Buscar por categoría"
          className="border rounded p-2 mb-4"
          type="text"
          onChange={handleSearchBar}
        />
      </div>

      {isError && <p>Error: {JSON.stringify(error)} </p>}

      {searchValue && Array.isArray(searchResult) && searchResult.length > 0 ? (
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
        <p className="text-center text-lg font-bold mt-4">No hay resultados</p>
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
            <p className="w-full bg-slate-100 py-4 text-center">Cargando...</p>
          )}
          {isError && <p>Error: {JSON.stringify(error)}</p>}
          {data && isFetchingNextPage && (
            <p className="w-full bg-slate-100 py-4 text-center">Cargando...</p>
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
  );
};

export default PrimaryTimelines;
