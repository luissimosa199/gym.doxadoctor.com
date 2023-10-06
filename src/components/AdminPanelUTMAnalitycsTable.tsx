import React from 'react';

type UserAgent = {
  visits: {
    utm_params?: {
      utm_source?: string;
      utm_medium?: string;
      utm_campaign?: string;
    };
  }[];
};

type Props = {
  data: UserAgent[];
};

const UTMAnalyticsTable: React.FC<Props> = ({ data }) => {
  let totalUTMVisits = 0;
  const utmSourceCounts: { [key: string]: number } = {};
  const utmMediumCounts: { [key: string]: number } = {};
  const utmCampaignCounts: { [key: string]: number } = {};

  data.forEach((item) => {
    item.visits.forEach((visit) => {
      if (visit.utm_params) {
        totalUTMVisits++;
        if (visit.utm_params.utm_source) {
          utmSourceCounts[visit.utm_params.utm_source] =
            (utmSourceCounts[visit.utm_params.utm_source] || 0) + 1;
        }
        if (visit.utm_params.utm_medium) {
          utmMediumCounts[visit.utm_params.utm_medium] =
            (utmMediumCounts[visit.utm_params.utm_medium] || 0) + 1;
        }
        if (visit.utm_params.utm_campaign) {
          utmCampaignCounts[visit.utm_params.utm_campaign] =
            (utmCampaignCounts[visit.utm_params.utm_campaign] || 0) + 1;
        }
      }
    });
  });

  return (
    <table className="min-w-full bg-white divide-y divide-gray-200 shadow-sm rounded-lg overflow-hidden mb-6">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Parameter</th>
          <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Breakdown</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        <tr>
          <td className="px-6 py-4">Total de visitas con parámetros UTM</td>
          <td className="px-6 py-4">{totalUTMVisits}</td>
        </tr>
        <tr>
          <td className="px-6 py-4">Source</td>
          <td className="px-6 py-4">
            {Object.entries(utmSourceCounts).map(([key, count]) => (
              <div className="capitalize" key={key}>
                {key}: <span className="font-semibold">{count}</span>
              </div>
            ))}
          </td>
        </tr>
        <tr>
          <td className="px-6 py-4">Medium</td>
          <td className="px-6 py-4">
            {Object.entries(utmMediumCounts).map(([key, count]) => (
              <div className="capitalize" key={key}>
                {key}: <span className="font-semibold">{count}</span>
              </div>
            ))}
          </td>
        </tr>
        <tr>
          <td className="px-6 py-4">Campaign</td>
          <td className="px-6 py-4">
            {Object.entries(utmCampaignCounts).map(([key, count]) => (
              <div key={key}>
                {key}: <span className="font-semibold">{count}</span>
              </div>
            ))}
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export default UTMAnalyticsTable;
