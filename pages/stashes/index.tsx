import { authOptions } from "pages/api/auth/[...nextauth]";
import { getSession, useSession } from "next-auth/react";
import { getServerSession } from "next-auth";
import type { Stash } from "@prisma/client";
import type { Session } from "inspector";
import { GetServerSideProps } from "next";
import prisma from "../../lib/prismadb";
import Link from "next/link";
// import type { Stash } from "@prisma/client";

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getServerSession(req, res, authOptions);
  //   const session = await getSession({ req });

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
  return (
    <>
      <div className="flex justify-center">
        <h1>My Stashes</h1>
      </div>
      <div className="grid grid-cols-4 gap-4 place-items-center">
        {props.stashes.map((stash) => (
          <div key={stash.id}>
            <Link href={`/stashes/${stash.id}`}>
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">
                {stash.name}
              </button>
            </Link>
          </div>
        ))}
        <div>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
            onClick={() => {
              const modal = document.getElementById("my_modal_5");
              if (modal) {
                modal.showModal();
              }
            }}
          >
            Create New Stash
          </button>
          <dialog
            id="my_modal_5"
            className="modal modal-bottom sm:modal-middle"
          >
            <div className="modal-box">
              <h3 className="font-bold text-lg">Hello!</h3>
              <p className="py-4">
                Press ESC key or click the button below to close
              </p>
              <div className="modal-action">
                <form method="dialog">
                  {/* if there is a button in form, it will close the modal */}
                  <button className="btn">Close</button>
                </form>
              </div>
            </div>
          </dialog>
        </div>
      </div>
    </>
  );
};

export default Stashes;
