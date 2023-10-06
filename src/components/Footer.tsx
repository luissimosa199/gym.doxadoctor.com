import Link from "next/link";
import React from "react";
import WhatsAppBtn from "./WhatsAppBtn";

const Footer = () => {
  return (
    <footer className="flex flex-col md:flex-row md:justify-around p-10 bg-base-200 text-base-content relative">
      {/* <WhatsAppBtn tlf={1156160290} /> */}
      <div className="flex flex-col gap-2 mb-2 md:mb-4">
        <Link href="/">
          <span className="hover:underline">Homepage</span>
        </Link>

        <Link href="/perfil">
          <span className="hover:underline">Perfil</span>
        </Link>
      </div>

      <div className="flex flex-col gap-2 mb-2 md:mb-4">
        <Link href="/videocall">
          <span className="hover:underline">Iniciar consulta</span>
        </Link>

        <Link href="/alumnos">
          <span className="hover:underline">Alumnos</span>
        </Link>
      </div>

      <div className="flex flex-col gap-2 mb-2 md:mb-4">
        <Link href="/videocall">
          <span className="hover:underline">Videollamadas</span>
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
