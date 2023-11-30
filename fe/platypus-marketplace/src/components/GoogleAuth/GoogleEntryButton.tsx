/*eslint no-unused-vars: "off"*/

"use client";
import React from "react";
import {
  signIn,
  useSession,
  LiteralUnion,
  ClientSafeProvider,
} from "next-auth/react";
import GoogleButton from "../Button/GoogleButton/GoogleButton";
import { BuiltInProviderType } from "next-auth/providers/index";

interface IGoogleEntryProvider {
  providers: Record<LiteralUnion<BuiltInProviderType>, ClientSafeProvider>;
}

const GoogleEntryButton = ({ providers }: IGoogleEntryProvider) => {
  const { data: session } = useSession();

  return (
    <GoogleButton name="google-entry" onClick={() => signIn("google")}>
      Google
    </GoogleButton>
  );
};

export default GoogleEntryButton;
