import {
  faUserDoctor,
  faClock,
  faDollarSign,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import { useState } from "react";

const VideoCallLobby = () => {
  const router = useRouter();
  const { student, username, time, amount } = router.query;

  const [paymentLink, setPaymentLink] = useState<string | null>(
    "https://mp.pago.com/1234567"
  );

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleProceedToCall = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    if (!time) {
      throw new Error("Time is required");
    }
    const dataToSend = {
      duration: parseInt(time as string) * 60 * 1000,
    };

    try {
      const response = await fetch(
        `/api/videocall?room=${username as string}y${student as string}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToSend),
        }
      );

      if (response.ok) {
        router.push(`/videocall/${username as string}y${student as string}`);
      } else {
        // custom responses depending on the be
        const responseData = await response.json();
        console.error("Error creating call:", responseData.error);
      }
    } catch (error) {
      console.error("Network or other error:", error);
    }
  };

  return (
    <div className="bg-white w-96 mx-auto mt-10 min-h-screen">
      <div className="p-4 rounded shadow-md">
        <div className="mb-4">
          <div className="flex gap-2 mb-1 items-center">
            <FontAwesomeIcon icon={faUserDoctor} />
            <p className="text-gray-600">Especialista:</p>
          </div>
          <div className="flex items-center justify-between bg-gray-100 p-2 rounded-md">
            <span>{username}</span>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex gap-2 mb-1 items-center">
            <FontAwesomeIcon icon={faUser} />
            <p className="text-gray-600">Alumno:</p>
          </div>
          <div className="flex items-center justify-between bg-gray-100 p-2 rounded-md">
            <span>{student}</span>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex gap-2 mb-1 items-center">
            <FontAwesomeIcon
              icon={faClock}
              className=""
            />
            <p className="text-gray-600">Tiempo de la consulta:</p>
          </div>
          <div className="flex items-center justify-between bg-gray-100 p-2 rounded-md">
            <span>{time} min.</span>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex gap-2 mb-1 items-center">
            <FontAwesomeIcon
              icon={faDollarSign}
              className=""
            />
            <p className="text-gray-600">Monto a abonar:</p>
          </div>
          <div className="flex items-center justify-between bg-gray-100 p-2 rounded-md">
            <span>${amount}</span>
          </div>
        </div>

        {/* <div className="mb-4 mt-2">
                <div className="flex gap-2 mb-1 items-center">
                    <FontAwesomeIcon icon={faLink} className="" />
                    <p className="text-gray-600">Link de pago</p>
                </div>
                <div className="flex items-center justify-between bg-gray-100 p-2 rounded-md">
                    <span>{paymentLink}</span>
                    <button onClick={() => handleCopy(paymentLink as string)} className="text-blue-500 hover:text-blue-600">
                        Copiar
                    </button>
                </div>
            </div> */}

        {/* <div className="mt-2 bg-blue-500 w-full text-white text-center py-2 px-4 rounded hover:bg-blue-600 focus:outline-none">
        <Link
          href={`/videocall/${username as string}y${
            student as string
          }?time=${time}`}
          className=""
        >
          Proceder a la consulta
        </Link>
      </div> */}
        <button
          onClick={handleProceedToCall}
          className="mt-2 bg-blue-500 w-full text-white text-center py-2 px-4 rounded hover:bg-blue-600 focus:outline-none"
        >
          Proceder a la consulta
        </button>
      </div>
    </div>
  );
};

export default VideoCallLobby;
