import Link from "next/link";
import NavBarButton from "./NavBarButton";
import { faPowerOff } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { signOut, useSession } from "next-auth/react";
import ProfilePicture from "./ProfilePicture";

const Navbar = () => {
  const { data: session } = useSession();

  return (
    <header className="flex justify-between gap-2 p-2 bg-base-100">
      <div className="flex items-center w-1/3">
        <NavBarButton />
      </div>

      <div className="w-full justify-center flex items-center">
        <p className="text-3xl text-center">{session?.user?.name}</p>
      </div>

      <div className="flex gap-1 md:gap-2 items-center justify-end w-1/3">
        {session ? (
          <div className="w-[60px] h-[60px]">
            <ProfilePicture
              type="user"
              w="w-[60px]"
              h="h-[60px]"
            />
          </div>
        ) : (
          <Link href="/login">
            <p className="text-3xl">Iniciar Sesion</p>
          </Link>
        )}

        <button
          className=""
          onClick={() => signOut()}
        >
          <div className="">
            <FontAwesomeIcon icon={faPowerOff} />
          </div>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
