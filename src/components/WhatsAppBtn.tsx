import Link from "next/link";
import React from "react";
import dynamic from "next/dynamic";
import WhatsAppLogo from "./WhatsAppLogo";

const DynamicWhatssAppBtn = ({ tlf }: { tlf: number }) => {
  return (
    <div className="flex justify-center z-40 drop-shadow-xl rounded-full w-6 h-6 items-center fixed bottom-12 right-8 scale-150 hover:opacity-75 transition-all ">
      <Link
        href={`https://api.whatsapp.com/send?phone=549${tlf}`}
        target="_blank"
      >
        <WhatsAppLogo />
      </Link>
    </div>
  );
};

// Dynamically create the component
const DynamicWhatsAppBtn = dynamic(() => Promise.resolve(DynamicWhatssAppBtn), {
  loading: () => (
    <div className="flex justify-center items-center bg-green-400 rounded-full fixed bottom-3 right-3 "></div>
  ),
  ssr: false,
});

function WhatsAppBtn({ tlf }: { tlf: number }) {
  return <DynamicWhatsAppBtn tlf={tlf} />;
}

export default WhatsAppBtn;
