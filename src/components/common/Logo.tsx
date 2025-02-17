import Image from "next/image";
import Link from "next/link";
import React from "react";

const Logo = () => {
  return (
    <Link href="/" className="flex relative items-center gap-2">
      <div className="h-4 w-4 absolute left-9 top-4 -z-10 bg-white" />
      <Image src="/logo.png" alt="Logo" height={20} width={70} />
      <span className="font-bold text-xl mt-2">Rentality</span>
    </Link>
  );
};

export default Logo;
