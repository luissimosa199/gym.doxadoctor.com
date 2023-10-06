import { getServerSession } from "next-auth"
import { GetServerSideProps } from "next/types"
import { FunctionComponent } from "react"
import { CustomSession, authOptions } from "./api/auth/[...nextauth]"
import { useQuery } from "@tanstack/react-query"
import GlobalInfoTable from "@/components/AdminPanelGlobalInfoTable"
import TenUsersInfoTable from "@/components/AdminPanelTenUsersInfoTable"
import { fetchUserAgentData } from "@/utils/adminPanelHelpers"
import UTMAnalyticsTable from "@/components/AdminPanelUTMAnalitycsTable"
import { UserAgent } from '@/utils/adminPanelHelpers';
import VisitsTable from "@/components/AdminPanelVisitsTable"

interface AdminPageInterface {
    name: string
    email: string
}

const Admin: FunctionComponent<AdminPageInterface> = ({ name, email }) => {

    const { data, isLoading, error } = useQuery(["user_agent_data"], fetchUserAgentData)
 
    if (isLoading) {
        return (
            <p>Cargando datos...</p>
        )
    }

    if (error) {
        return (
            <p>Error. {JSON.stringify(error)}</p>
        )
    }

    const allVisits = data.userAgentData.flatMap((item: UserAgent) => item.visits);

    // Your component logic remains here
    return (
        <div>
            <p className="mb-6 p-4">Logueado como {name} ({email})</p>

            <div className="mb-12">
                <GlobalInfoTable data={data.userAgentData} users={data.users} />
            </div>

            <div className="mb-12">
                <TenUsersInfoTable data={data.userAgentData} users={data.users} />
            </div>

            <div className="mb-12">
                <UTMAnalyticsTable data={data.userAgentData} />
            </div>

            <div className="mb-12">
                <VisitsTable visits={allVisits}/>
            </div>

        </div>

    )
}

export const getServerSideProps: GetServerSideProps<AdminPageInterface> = async (context) => {
    const session: CustomSession | null = await getServerSession(context.req, context.res, authOptions)

    if (!session || session?.role !== "ADMIN") {
        return {
            redirect: {
                destination: session ? '/' : '/login',
                permanent: false
            }
        }
    }

    return {
        props: {
            name: session?.user?.name || "Usuario",
            email: session?.user?.email || "Usuario",
        }
    }
}

export default Admin
