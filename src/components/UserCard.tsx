import Image from "next/image";
import { FunctionComponent } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";
import ProfilePicture from "./ProfilePicture";
import ProfileButtonsPanel from "./ProfileButtonsPanel";

interface UserCardProps {
  imageSrc: string;
  name: string;
  description: string;
}

const UserCard: FunctionComponent<UserCardProps> = ({
  imageSrc,
  name,
  description,
}) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="min-w-full mb-8">
        <div className="text-center">Cargando datos de usuario...</div>
      </div>
    );
  }

  if (session && session.user) {
    return (
      <div className="min-w-full mb-8">
        <div className="bg-white shadow-md rounded p-4 flex flex-col items-center mb-4">
          <Link href="/perfil">
            <ProfilePicture type="user" />
          </Link>
          <div className="text-center flex flex-col gap-2">
            <p className="font-bold">{session.user.name}</p>
            <p className="italic">{session.user.email}</p>
            <ProfileButtonsPanel />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-full mb-8">
      <div className="bg-white shadow-md rounded p-4 flex flex-col items-center mb-4">
        <Image
          src={imageSrc}
          width={128}
          height={128}
          alt={`${name}'s Avatar`}
          className="w-16 h-16 object-cover rounded-full mb-4 md:mb-0"
        />
        <div className="text-center">
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="font-bold"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
