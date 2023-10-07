import { TimelineFormInputs } from "@/types";

export const getTimelines = async (
  key: string,
  page = 0,
  username?: string
) => {
  const response = await fetch(
    `/api/timeline?page=${page}${username ? `&username=${username}` : ""}`
  );
  const data: Promise<TimelineFormInputs[]> = await response.json();
  return data;
};
