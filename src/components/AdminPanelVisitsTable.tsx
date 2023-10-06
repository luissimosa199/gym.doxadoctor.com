import React from 'react';

type Visit = {
  timestamp: string;
};

type Props = {
  visits: Visit[];
};

const VisitsTable: React.FC<Props> = ({ visits }) => {
  // Generate an array of the last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().slice(0, 10); // YYYY-MM-DD format
  }).reverse();

  // Count visits for each of the last 7 days
  const counts = last7Days.map((day) => 
    visits.filter((visit) => visit.timestamp.startsWith(day)).length
  );

  return (
    <table className="min-w-full bg-white divide-y divide-gray-200 shadow-sm rounded-lg overflow-hidden mb-6">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Fecha</th>
          <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Visitas</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {last7Days.map((day, index) => (
          <tr key={day}>
            <td className="px-6 py-4 whitespace-nowrap">{day}</td>
            <td className="px-6 py-4 whitespace-nowrap">{counts[index]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default VisitsTable;
