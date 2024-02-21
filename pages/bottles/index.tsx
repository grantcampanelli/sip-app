import { authOptions } from "pages/api/auth/[...nextauth]";
import { getSession, useSession } from "next-auth/react";
import { getServerSession } from "next-auth";
import type { Bottle, Prisma } from "@prisma/client";
import type { Session } from "inspector";
import { GetServerSideProps } from "next";
import prisma from "../../lib/prismadb";
import Link from "next/link";
// import type { Stash } from "@prisma/client";

type BottleWithFullData = Prisma.BottleGetPayload<{
  include: {
    product: {
      include: {
        brand: true;
      };
    };
  };
}>;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getServerSession(req, res, authOptions);
  //   const session = await getSession({ req });

  if (!session) {
    res.statusCode = 403;
    // console.log("checking session and not finding it in stashes:", session);

    //return { props: { stashes: [] } };
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const bottles = await prisma.bottle.findMany({
    where: {
      userId: session?.user?.id,
    },
    include: {
      product: true,
    },
  });
  return {
    props: { bottles },
  };
};

type Props = {
  bottles: Bottle[];
};

const Bottles: React.FC<Props> = (props) => {
  return (
    <>
      <div className="flex justify-center">
        <h1>My Bottles</h1>
      </div>
      <div className="grid grid-cols-4 gap-4 place-items-center">
        {props.bottles.map((bottle) => (
          <div key={bottle.id}>
            <Link href={`/bottles/${bottle.id}`}>
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">
                {bottle.id}
              </button>
            </Link>
          </div>
        ))}
      </div>
    </>
  );
};

export default Bottles;
