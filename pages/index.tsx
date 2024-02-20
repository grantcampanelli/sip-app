// * NEXTAUTH
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";

export default function Page() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="container">
        <p>You're signed in</p>
      </div>
    );
  }
  return (
    <div className="container">
      <Image src="/SipLogo.png" width={500} height={500} alt="Sip Logo" />
    </div>
  );
}
