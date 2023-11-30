"use client";
import { SessionProvider } from "next-auth/react";
import React, { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

const Providers = (props: Props) => {
  return (
    <SessionProvider baseUrl="/vm4/api/auth" basePath="/vm4/api/auth">
      {props.children}
    </SessionProvider>
  );
};

export default Providers;
