import { useSession } from "next-auth/react";
import LastTenUserTimeline from "@/components/LastTenUserTimeline";
import UserPhotoGallery from "@/components/UserPhotoGallery";
import ProfileCard from "@/components/ProfileCard";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faPlus } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useState } from "react";
import PrimaryForm from "@/components/PrimaryForm";

const Profile = () => {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [addNewTimeline, setAddNewTimeline] = useState<boolean>(false);

  if (status === "loading") {
    return (
      <div className="animate-pulse">
        <div className="p-8 bg-gray-50 space-y-12">
          <h1 className="text-4xl font-bold mb-10 bg-gray-300 w-1/3 h-10"></h1>

          <div className="flex flex-col md:flex-row justify-around items-center border rounded-lg p-6 bg-gray-200 shadow-lg">
            <div className="bg-gray-300 w-32 h-32 rounded-full mx-auto md:mx-0"></div>
            <div className="space-y-4 mt-4 md:mt-0">
              <div className="bg-gray-300 h-8 w-1/2 mx-auto md:mx-0"></div>
              <div className="bg-gray-300 h-6 w-3/4 mx-auto md:mx-0"></div>
              <div className="bg-red-500 w-1/2 h-8 mx-auto md:mx-0"></div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl bg-gray-300 w-1/4 h-8"></h2>
            <div className="bg-gray-300 h-12 w-1/2 mx-auto"></div>
            <div className="bg-gray-300 h-10 w-full"></div>
          </div>

          <div className="mt-6 space-y-4">
            <h2 className="text-2xl bg-gray-300 w-2/5 h-8"></h2>
            <div className="bg-gray-200 p-4 rounded space-y-4">
              <div className="bg-gray-300 h-10 w-full"></div>
              <div className="bg-gray-300 h-10 w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (session && session.user) {
    return (
      <>
        <div className="p-8 bg-gray-50 space-y-12">
          <div className="flex gap-2 items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/">
                <FontAwesomeIcon icon={faArrowLeft} />
              </Link>
              <h1 className="text-4xl font-bold text-gray-800 border-b-2 pb-3">
                Perfil
              </h1>
            </div>
          </div>
          <ProfileCard />
          <UserPhotoGallery />
          <div className="mt-6">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 border-b-2 pb-2">
              Últimas publicaciones
            </h2>
            <button
              className={`border-2 w-10 rounded p-2 ${
                addNewTimeline ? "bg-gray-200" : "bg-white"
              } text-slate-600 transition`}
              onClick={(e) => {
                e.preventDefault();
                setAddNewTimeline(!addNewTimeline);
              }}
            >
              <FontAwesomeIcon icon={faPlus} />
            </button>
            {addNewTimeline && <PrimaryForm />}

            <LastTenUserTimeline username={session.user.email as string} />
          </div>
        </div>
      </>
    );
  }

  if (!session || !session.user) {
    router.push("/login");
    return null;
  }
};

export default Profile;
