import Link from "next/link";
import React, { useState } from "react";

const NavBarButton = () => {
  const [showNavBar, setShowNavBar] = useState<boolean>(false);

  const handleOpenNavBar = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    setShowNavBar(!showNavBar);
  };

  return (
    <button
      className="cursor-pointer relative"
      onClick={handleOpenNavBar}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M4 6h16M4 12h16M4 18h7"
        />
      </svg>
      {showNavBar && (
        <ul
          tabIndex={0}
          className="mt-3 p-2 bg-white shadow rounded bg-base-100 w-52 z-40 absolute text-xl flex flex-col gap-4"
        >
          <li>
            <Link href="/">Homepage</Link>
          </li>
          <li>
            <Link href="/perfil">Perfil</Link>
          </li>
          <li>
            <Link href="/videocall">Iniciar Consulta</Link>
          </li>
          <li>
            <Link href="/alumnos">Alumnos</Link>
          </li>
          <li>
            <Link href="/alumnos">Videollamadas</Link>
          </li>
        </ul>
      )}
    </button>
  );
};

export default NavBarButton;
