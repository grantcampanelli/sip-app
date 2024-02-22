import React from "react";
import { useSession, getSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

const SignedIn = () => {
  const { data: session } = useSession();
  if (session) {
    return (
      <>
        <div className="flex items-center">
          <a href="/bottles" className="ml-8 text-gray-900 hover:text-gray-900">
            Bottles
          </a>
          <a href="/stashes" className="ml-8 text-gray-900 hover:text-gray-900">
            Stashes
          </a>

          <a className="ml-8 text-gray-900 hover:text-gray-900">
            <button onClick={() => signOut()}>Sign Out</button>
          </a>
        </div>
      </>
    );
  } else {
    return (
      <>
        <div className="flex items-center">
          <a className="ml-8 text-gray-900 hover:text-gray-900">
            <button onClick={() => signIn()}>Sign in</button>
          </a>
        </div>
      </>
    );
  }
};
const Header = () => {
  return (
    <header className="bg-sky-100">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
        aria-label="Global"
      >
        <div className="flex items-center text-gray-900 hover:text-gray-900">
          <Link href="/">
            <Image
              src="/SipLogoNoTag.png"
              width={100}
              height={100}
              alt="Sip Logo"
            />
          </Link>
        </div>
        <SignedIn />
      </nav>
    </header>
  );
};

export default Header;
