import {
  IconDefinition,
  faChartBar,
  faDollarSign,
  faLifeRing,
  faStethoscope,
  faUsers,
  faVideo,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import React, { FunctionComponent } from "react";
import AdsSwitch from "./AdsSwitch";

const buttons = [
  {
    icon: faStethoscope,
    href: "videocall",
    name: "Iniciar consulta",
    color: "bg-sky-400",
  },
  {
    icon: faUsers,
    href: "alumnos",
    name: "Alumnos",
    color: "bg-emerald-400",
  },
  // { icon: faLifeRing, href: "soporte", name: "Soporte", color: 'bg-yellow-400' },
  {
    icon: faVideo,
    href: "alumnos",
    name: "Videollamadas",
    color: "bg-violet-400",
  },
  // { icon: faDollarSign, href: "promo", name: "Promoción", color: 'bg-green-400' },
  // { icon: faChartBar, href: "estadisticas", name: "Ver estadísticas", color: 'bg-teal-400' },
];

const ProfileButtonsPanel: FunctionComponent = () => {
  return (
    <ul>
      {buttons.map((e, idx) => {
        return (
          <li
            key={idx}
            className="underline text-lg mb-2 hover:opacity-70"
          >
            <Link href={e.href}>{e.name}</Link>
          </li>
        );
      })}
    </ul>
  );
};

export default ProfileButtonsPanel;
