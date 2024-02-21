import { getSession, useSession } from "next-auth/react";
import type { Stash } from "@prisma/client";
import type { Session } from "inspector";
import { GetServerSideProps } from "next";
import prisma from "../../lib/prismadb";
// import type { Stash } from "@prisma/client";

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getSession({ req });

  if (!session) {
    res.statusCode = 403;
    console.log("checking session and not finding it in stashes:", session);

    //return { props: { stashes: [] } };
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const stashes = await prisma.stash.findMany({
    where: {
      userId: session?.user?.id,
    },
  });
  return {
    props: { stashes },
  };
};

type Props = {
  stashes: Stash[];
};

const Stashes: React.FC<Props> = (props) => {
  //   const { data: session } = useSession();

  //   if (!session) {
  //     return (
  //       <>
  //         <h1>You're not authenticated, please sign in</h1>
  //       </>
  //     );
  //   }

  return (
    <>
      <div className="flex justify-center">
        <h1>My Stashes</h1>
      </div>
      <div className="grid grid-cols-4 gap-4 place-items-center">
        {props.stashes.map((stash) => (
          <div key={stash.id}>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">
              {stash.name}
            </button>
          </div>
        ))}
      </div>
    </>
  );
};

export default Stashes;
