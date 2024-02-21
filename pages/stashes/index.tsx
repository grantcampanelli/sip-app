import { getSession, useSession } from "next-auth/react";
import type { Stash } from "@prisma/client";
import { GetServerSideProps } from "next";
import prisma from "../../lib/prismadb";
// import type { Stash } from "@prisma/client";

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getSession({ req });
  if (!session) {
    res.statusCode = 403;
    return { props: { stashes: [] } };
  }

  const stashes = await prisma.stash.findMany({
    // where: {
    //   author: { email: session.user.email },
    //   published: false,
    // },
    // include: {
    //   author: {
    //     select: { name: true },
    //   },
    // },
  });
  return {
    props: { stashes },
  };
};

type Props = {
  stashes: Stash[];
};

const Stashes: React.FC<Props> = (props) => {
  const { data: session } = useSession();

  if (!session) {
    return (
      <>
        <h1>My Drafts</h1>
        <div>You need to be authenticated to view this page.</div>
      </>
    );
  }

  return (
    <>
      <div className="page">
        <h1>My Stashes</h1>
        <main>
          {props.stashes.map((stash) => (
            <div key={stash.id}>
              <h2>{stash.name}</h2>
            </div>
          ))}
        </main>
      </div>
      <style jsx>{`
        .post {
          background: var(--geist-background);
          transition: box-shadow 0.1s ease-in;
        }

        .post:hover {
          box-shadow: 1px 1px 3px #aaa;
        }

        .post + .post {
          margin-top: 2rem;
        }
      `}</style>
    </>
  );
};

export default Stashes;

// export default function Page() {
//   const { data: session, status } = useSession();

//   //fetch stashes from the database
//   async function getStashes(): Promise<Stash[]> {
//     // Update the return type to Stash[]
//     "use server";
//     const fetchedStashes = await fetch("/api/stashes"); // replace with your API endpoint
//     const stashesData: Stash[] = await fetchedStashes.json();
//     console.log("stashes:", stashesData);
//     return stashesData;
//   }

//   let stashes: Stash[] = [];
//   getStashes().then((fetchedStashes) => {
//     stashes = fetchedStashes;
//   });

//   if (status === "loading") {
//     return <p>Loading...</p>;
//   }
//   if (status === "unauthenticated") {
//     return <p>Access Denied</p>;
//   } else {
//     return (
//       <>
//         <h1>Protected Page</h1>
//         <p>You can view this page because you are signed in.</p>
//         <p>
//           Stash 1:
//           {stashes[0]?.name}
//         </p>
//         <p></p>
//       </>
//     );
//   }

//   // write the front end code to display the stashes after waiting
//   console.log(stashes[0]?.name);

//   //   return (
//   //     <>
//   //       <h1>Protected Page</h1>
//   //       <p>You can view this page because you are signed in.</p>
//   //       <p>Stash 1: {stashes[0]?.name}</p>
//   //       <p></p>
//   //     </>
//   //   );
//   console.log(session, status);
// }
