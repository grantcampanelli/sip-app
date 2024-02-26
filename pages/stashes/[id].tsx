import { authOptions } from "pages/api/auth/[...nextauth]";
import { getSession, useSession } from "next-auth/react";
import { getServerSession } from "next-auth";
import { Stash, Shelf, ShelfItem, Bottle, Prisma } from "@prisma/client";
import type { Session } from "inspector";
import { GetServerSideProps } from "next";
import prisma from "../../lib/prismadb";
import Link from "next/link";
import { Container, Button, Grid, Group } from "@mantine/core";

type StashWithFullData = Prisma.StashGetPayload<{
  include: {
    shelves: {
      include: {
        shelfItems: {
          include: {
            bottle: true;
          };
        };
      };
    };
  };
}>;

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
  let stash: StashWithFullData | null = null;
  stash =
    (await prisma.stash.findUnique({
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
    })) || null;

  return {
    props: {
      stash,
      // shelves: stash?.shelves
    },
  };
};

type Props = {
  stash: StashWithFullData;
  //   shelves: Shelf[];
};

const Stashes: React.FC<Props> = (props) => {
  //   console.log("shelves: ", props.shelves);
  return (
    <Container>
      <Group justify="space-between" h="100%" pl="10px" pt="10px">
        <h1>{props.stash.name}</h1>

        <Link href="/shelf/create">
          <Button>Create Shelf</Button>
        </Link>
      </Group>

      <Grid>
        {props.stash.shelves.map((shelf, index) => (
          <Grid.Col span={{ base: 12, xs: 4 }} key={shelf.id}>
            {/* <Link
              style={{ textDecoration: "none" }}
              href={`/stashes/${stash.id}`}
            > */}
            <Button fullWidth>Shelf {index + 1}</Button>
            {/* </Link> */}
          </Grid.Col>
        ))}
      </Grid>
    </Container>
    // <>
    //   <div className="flex justify-center">
    //     <h1 className="text-2xl font-bold">{props.stash.name}</h1>
    //     {/* <h2>try {props.stash.shelves[0].shelfItems[0].bottleId}</h2> */}
    //   </div>
    //   <div className="grid grid-cols-4 gap-4 place-items-center">
    //     {/* <ul> */}
    //     {props.stash.shelves.map((shelf) => (
    //       // <li key={shelf.id}>
    //       <p>{shelf.name}</p>
    //     ))}
    //     {/* </ul> */}
    //   </div>
    // </>
  );
};

export default Stashes;
