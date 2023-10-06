import TimeLine from "@/components/TimeLine";
import UserCard from "@/components/UserCard";
import dbConnect from "@/db/dbConnect";
import { TimeLineModel } from "@/db/models";
import { TimelineFormInputs } from "@/types";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import Link from "next/link";
import { FunctionComponent, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { authOptions } from "../api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import { noProfileImage } from "@/utils/noProfileImage";

interface TimelinePageProps {
  timelineData: TimelineFormInputs | null;
}

const TimelinePage: FunctionComponent<TimelinePageProps> = ({
  timelineData,
}) => {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  if (!timelineData) {
    return <div>Publicación no encontrada</div>;
  }

  return (
    <>
      <div className="border flex justify-center items-center">
        <Link
          className="text-xs"
          href="/"
        >
          Volver
        </Link>
        <h1 className="text-xl text-center font-bold m-4">Nota</h1>
      </div>
      <UserCard
        imageSrc={noProfileImage}
        name="Anonimo"
        description="Sin descripcion"
      />
      <div>
        <div key={timelineData._id}>
          <TimeLine
            _id={timelineData._id}
            tags={timelineData.tags}
            mainText={timelineData.mainText}
            length={timelineData.length}
            timeline={timelineData.photo}
            createdAt={timelineData.createdAt}
            authorId={timelineData.authorId}
            authorName={timelineData.authorName}
            links={timelineData.links}
            urlSlug={timelineData.urlSlug}
          />
        </div>
      </div>
    </>
  );
};

export default TimelinePage;

export const getServerSideProps: GetServerSideProps<TimelinePageProps> = async (
  context: GetServerSidePropsContext
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

    const { id } = context.query;

    const timeline = await TimeLineModel.findOne({
      urlSlug: id,
      authorId: session.user.email,
    }).lean();

    if (!timeline) {
      return {
        notFound: true,
      };
    }

    const timelineData = {
      _id: timeline._id,
      urlSlug: timeline.urlSlug || "",
      mainText: timeline.mainText,
      length: timeline.length,
      photo: timeline.photo,
      createdAt: timeline.createdAt.toISOString(),
      tags: timeline.tags || [],
      authorId: timeline.authorId || "",
      authorName: timeline.authorName || "",
      links: timeline.links,
    };

    return {
      props: {
        timelineData,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      notFound: true,
    };
  }
};
