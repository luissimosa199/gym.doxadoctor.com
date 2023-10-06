import { FunctionComponent } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { noProfileImage } from "@/utils/noProfileImage";
import { CldImage } from "next-cloudinary";

interface ProfilePictureProps {
  userId?: string;
  w?: string;
  h?: string;
  type: "user" | "alumnos";
}

const ProfilePicture: FunctionComponent<ProfilePictureProps> = ({
  userId,
  w,
  h,
  type,
}) => {
  const { data: session } = useSession();

  const fetchProfilePicture = async () => {
    const response = await fetch(
      `/api/${type}/avatar/?${
        type === "user"
          ? `username=${encodeURIComponent(session?.user?.email as string)}`
          : `userId=${userId}`
      }`
    );
    const data = response.json();
    return data;
  };

  const { data, isLoading, isError } = useQuery(
    [userId || session?.user?.email, "profilePicture"],
    fetchProfilePicture
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center">
        <div className="object-cover rounded-full border mb-4"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center">
        <div className="object-cover rounded-full border mb-4">
          <p>Error</p>
        </div>
      </div>
    );
  }

  return (
    <Link
      href="/perfil"
      className="w-full h-full"
    >
      <div
        className={`flex ${w} ${h} flex-col items-center justify-center relative`}
      >
        <CldImage
          src={(data.image as string) || noProfileImage}
          fill
          alt={`${userId}'s Avatar`}
          className={`object-cover absolute rounded-full border-2 border-gray-300 w-full`}
        />
      </div>
    </Link>
  );
};

export default ProfilePicture;
