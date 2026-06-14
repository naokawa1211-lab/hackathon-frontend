import React from "react";
import { HomeNavigation } from "../navigation/HomeNavigation";

interface Props {
  children: React.ReactNode;
}

export default function HomeLayout({ children }: Props) {
  return (
    <HomeNavigation>
      {children}
    </HomeNavigation>
  );
}