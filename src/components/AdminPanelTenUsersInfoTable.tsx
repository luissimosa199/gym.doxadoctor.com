import { UserAgent, mostFrequentValue } from "@/utils/adminPanelHelpers"

const TenUsersInfoTable = ({ data, users }: { data: UserAgent[], users: { email: string, user_agent_id: string[] }[] }) => {

    const userIdToEmail: { [key: string]: string } = {};

    users.forEach(user => {
        user.user_agent_id.forEach(id => {
            userIdToEmail[id] = user.email;
        });
    });

    return (
        <table className="min-w-full bg-white divide-y divide-gray-200 shadow-sm rounded-lg overflow-hidden mb-6">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Email / ID</th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Visitas</th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Punto de entrada preferido</th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">OS Preferido</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {data.sort((a, b) => b.visits.length - a.visits.length).map((userAgent: UserAgent) => (
                    <tr key={userAgent._id}>
                        <td className="px-6 py-4 whitespace-nowrap">{userIdToEmail[userAgent._id] || userAgent._id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{userAgent.visits.length}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{mostFrequentValue(userAgent.visits, "entry_point")}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{mostFrequentValue(userAgent.visits.map(e => e.os), "name")}</td>
                    </tr>
                ))}
            </tbody>

        </table>
    )
}

export default TenUsersInfoTable
