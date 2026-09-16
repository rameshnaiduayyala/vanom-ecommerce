import React from "react";
import { Button as EmailButton } from "@react-email/components";

export function Button({ href, children }) {
  return <EmailButton href={href} className="rounded-md bg-gray-900 px-5 py-3 text-white no-underline">{children}</EmailButton>;
}
