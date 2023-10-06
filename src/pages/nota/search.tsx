import TimeLine from '@/components/TimeLine'
import UserCard from '@/components/UserCard'
import dbConnect from '@/db/dbConnect'
import { TimeLineModel } from '@/db/models'
import { TimelineFormInputs } from '@/types'
import { GetServerSideProps, GetServerSidePropsContext } from 'next'
import Link from 'next/link'
import { FunctionComponent, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { authOptions } from '../api/auth/[...nextauth]'
import { getServerSession } from 'next-auth'

interface SearchProps {
    timelineData: TimelineFormInputs[];
}

const Search: FunctionComponent<SearchProps> = ({ timelineData }) => {

    const router = useRouter();
    const { status } = useSession();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push('/login')
            return
        }
      
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status])
    

    return (
        <>
            <div className="border flex justify-center items-center">
                <Link className="text-xs" href="/">Volver</Link>
                <h1 className="text-xl text-center font-bold m-4">Mis publicaciones</h1>
            </div>
            <UserCard
                imageSrc="https://randomuser.me/api/portraits/men/5.jpg"
                name="Juan Silva"
                description="Ciclista Amateur"
            />
            <div>
                {timelineData && timelineData.length > 0 && timelineData.map((e) => {
                    return (
                        <div key={e._id}>
                            <TimeLine
                                _id={e._id}
                                tags={e.tags}
                                mainText={e.mainText}
                                length={e.length}
                                timeline={e.photo}
                                createdAt={e.createdAt}
                                authorId={e.authorId}
                                authorName={e.authorName}
                                links={e.links}
                            />
                        </div>
                    )
                })}
            </div>
        </>
    );
};

export default Search;

export const getServerSideProps: GetServerSideProps<SearchProps> = async (context: GetServerSidePropsContext) => {


    try {

        const session = await getServerSession(
            context.req,
            context.res,
            authOptions
        )

        if (!session || !session.user) {

            return {
                redirect: {
                    destination: '/login',
                    permanent: false,
                },
            };
        }

        await dbConnect();

        const { tags } = context.query;

        const tagsArray = Array.isArray(tags) ? tags : [tags];

        const response = await TimeLineModel.find({
            tags: { $all: tagsArray },
            authorId: session.user.email
        })
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        const timelineData = response.map((item) => ({
            _id: item._id,
            mainText: item.mainText,
            length: item.length,
            photo: item.photo,
            createdAt: item.createdAt.toISOString(),
            tags: item.tags || [],
            authorId: item.authorId || '',
            authorName: item.authorName || '',
            links: item.links || []
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