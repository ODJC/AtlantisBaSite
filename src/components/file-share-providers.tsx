"use client";

import {
  FileShareBrandProvider,
  type FileShareBrand,
} from "@atlantis/file-share";

const atlantisBrand: FileShareBrand = {
  name: "Atlantis BA",
  logoSrc: "/assets/logo_atlantisBA_Color_Alpha-8.png",
  logoAlt: "Atlantis BA",
  version: "1.0",
  colors: {
    primary: "#0b57e3",
  },
};

export function FileShareProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FileShareBrandProvider brand={atlantisBrand}>
      {children}
    </FileShareBrandProvider>
  );
}
