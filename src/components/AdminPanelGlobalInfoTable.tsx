import { UserAgent, getAggregateData } from '@/utils/adminPanelHelpers';
import React from 'react';

type GlobalInfoTableProps = {
  data: UserAgent[];
  users: {
    email: string;
    user_agent_id: string[];
    createAt: string;
  }[]
};

const GlobalInfoTable: React.FC<GlobalInfoTableProps> = ({ data, users }) => {

  const {
    totalVisits,
    topThreeEntryPoints,
    newUsersPercentage,
    returningUsersPercentage,
    topThreeOS
  } = getAggregateData(data);

  return (
    <table className="min-w-full bg-white divide-y divide-gray-200 shadow-sm rounded-lg overflow-hidden">
      <tbody className="bg-white divide-y divide-gray-200">
        <tr>
          <td className="px-6 bg-gray-50 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Visitas totales</td>
          <td className="px-6 py-4 ">{totalVisits}</td>
        </tr>
        <tr>
          <td className="px-6 bg-gray-50 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Dispositivos registrados</td>
          <td className="px-6 py-4 ">{data.length}</td>
        </tr>
        <tr>
          <td className="px-6 bg-gray-50 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">% Usuarios registrados</td>
          <td className="px-6 py-4 ">{(users.length * 100 / data.length).toFixed(2)}%</td>
        </tr>
        <tr>
          <td className="px-6 bg-gray-50 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Top 3 puntos de entrada</td>
          <td className="px-6 py-4">
            {topThreeEntryPoints.map(([entry, count]) => (
              <div key={entry}>
                {entry} <span className="font-semibold">({count})</span>
              </div>
            ))}
          </td>
        </tr>
        <tr>
          <td className="px-6 bg-gray-50 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">% Usuarios nuevos</td>
          <td className="px-6 py-4">{newUsersPercentage.toFixed(2)}%</td>
        </tr>
        <tr>
          <td className="px-6 bg-gray-50 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">% Usuarios recurrentes</td>
          <td className="px-6 py-4">{returningUsersPercentage.toFixed(2)}%</td>
        </tr>

        <tr>
          <td className="px-6 bg-gray-50 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Top 3 sistemas operativos</td>
          <td className="px-6 py-4">
            {topThreeOS.map(([osName, count]) => (
              <div key={osName}>
                {osName ? osName : "Bot"} <span className="font-semibold">({count})</span>
              </div>
            ))}
          </td>
        </tr>

      </tbody>
    </table>
  );
};

export default GlobalInfoTable;
