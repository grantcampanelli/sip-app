import { authOptions } from "pages/api/auth/[...nextauth]";
import { getSession, useSession } from "next-auth/react";
import { getServerSession } from "next-auth";
import type { Stash } from "@prisma/client";
import type { Session } from "inspector";
import { GetServerSideProps } from "next";
import prisma from "../../lib/prismadb";
// import type { Stash } from "@prisma/client";

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  query,
}) => {
  const session = await getServerSession(req, res, authOptions);
  //   const session = await getSession({ req });

  console.log("id query parm: ", query);
  let stashId: string = Array.isArray(query.id) ? "" : query.id || "";
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

  const stash = await prisma.stash.findUnique({
    where: {
      id: stashId,
    },
    include: {
      shelves: {
        include: {
          shelfItems: {
            include: {
              bottle: true,
            },
          },
        },
      },
    },
  });

  console.log("stash: ", stash);

  return {
    props: { stash },
  };
};

type Props = {
  stash: Stash;
};

const Stashes: React.FC<Props> = (props) => {
  return (
    <>
      <div className="flex justify-center">
        <h1>My Stashes</h1>
      </div>
      <div className="grid grid-cols-4 gap-4 place-items-center">
        <h1>{props.stash.name}</h1>
        {props.stash.shelves.map((shelf) => (
          <div key={shelf.id}>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">
              {shelf.name}
            </button>
          </div>
        ))}
      </div>
    </>
  );
};

export default Stashes;
