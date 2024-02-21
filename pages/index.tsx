// * NEXTAUTH
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";

export default function Page() {
  const { data: session } = useSession();

  // if (session) {
  //   return (
  //     <div className="container">
  //       <p>You're signed in</p>
  //     </div>
  //   );
  // }
  return (
    <div>
      <div className="grid grid-cols-3 justify-center">
        <div>
          <Image
            src="/images/beer-fridge-animated.png"
            alt="Beer Fridge"
            width={800}
            height={800}
          />
        </div>
        <div>
          <Image
            src="/images/whiskey-cabinet-animated.png"
            alt="Beer Fridge"
            width={800}
            height={800}
          />
        </div>
        <div className="justify-center">
          <Image
            src="/images/wine-fridge-animated.png"
            alt="Beer Fridge"
            width={800}
            height={800}
          />
        </div>
      </div>
    </div>
  );
}
