export interface Visit {
  timestamp: Date;
  utm_params?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
  };
  entry_point: string;
  device?: {
    model: string;
    type: string;
  };
  os: {
    name: string;
    version: string;
  };
  browser: {
    name: string;
    version: string;
    major: string;
  };
}

export interface UserAgent {
  _id: string;
  visits: Visit[];
}

interface AnyObject {
  [key: string]: any;
}

export const fetchUserAgentData = async () => {
    const response = await fetch("/api/user_agent_info", {
        method: "GET",
    })

    return await response.json()
}

export function mostFrequentValue<T extends AnyObject>(
  items: T[],
  key: string
): any {
  const count: { [value: string]: number } = {};

  items.forEach((item) => {
    const propertyValue = String(item[key]); // Convert value to string for easier lookup

    if (count[propertyValue]) {
      count[propertyValue]++;
    } else {
      count[propertyValue] = 1;
    }
  });

  let maxEntry = "";
  let maxCount = -1;

  for (const entry in count) {
    if (count[entry] > maxCount) {
      maxCount = count[entry];
      maxEntry = entry;
    }
  }

  // If the original property value is a number, convert it back
  if (!isNaN(Number(maxEntry))) {
    return Number(maxEntry);
  }

  return maxEntry;
}

export const getAggregateData = (data: UserAgent[]) => {
  const totalVisits = data.reduce((acc, curr) => acc + curr.visits.length, 0);

  const entryPointCounts: { [key: string]: number } = {};
  const osCounts: { [key: string]: number } = {};

  data.forEach((item) => {
    item.visits.forEach((visit) => {
      // Entry Point Count
      if (entryPointCounts[visit.entry_point]) {
        entryPointCounts[visit.entry_point]++;
      } else {
        entryPointCounts[visit.entry_point] = 1;
      }

      // Operating System Count
      if (osCounts[visit.os.name]) {
        osCounts[visit.os.name]++;
      } else {
        osCounts[visit.os.name] = 1;
      }
    });
  });

  const sortedEntryPoints = Object.entries(entryPointCounts).sort(
    (a, b) => b[1] - a[1]
  );
  const sortedOSCounts = Object.entries(osCounts).sort(
    (a, b) => b[1] - a[1]
  );

  const topThreeEntryPoints =
    sortedEntryPoints.length > 3
      ? sortedEntryPoints.slice(0, 3)
      : sortedEntryPoints;

  const topThreeOS =
    sortedOSCounts.length > 3
      ? sortedOSCounts.slice(0, 3)
      : sortedOSCounts;

  const uniqueUsers = new Set(data.map((item) => item._id));
  const totalUniqueUsers = uniqueUsers.size;
  const returningUsers = totalVisits - totalUniqueUsers;
  const newUsersPercentage = (totalUniqueUsers / totalVisits) * 100;
  const returningUsersPercentage = 100 - newUsersPercentage;

  return {
    totalVisits,
    topThreeEntryPoints,
    topThreeOS,
    newUsersPercentage,
    returningUsersPercentage,
  };
};
