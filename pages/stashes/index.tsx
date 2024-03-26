import { authOptions } from "pages/api/auth/[...nextauth]";
import { getSession, useSession } from "next-auth/react";
import { getServerSession } from "next-auth";
import type { Stash } from "@prisma/client";
import type { Session } from "inspector";
import { GetServerSideProps } from "next";
import prisma from "../../lib/prismadb";
import Link from "next/link";
import { Container, Grid, Image, Button, Group } from "@mantine/core";
export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    res.statusCode = 403;

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
    <Container>
      <Group justify="space-between" h="100%" pl="10px" pt="10px">
        <h1>My Stashes</h1>

        <Link href="/stashes/create">
          <Button>Create Stash</Button>
        </Link>
      </Group>

      <Grid>
        {props.stashes.map((stash) => (
          <Grid.Col span={{ base: 12, xs: 4 }} key={stash.id}>
            <Link
              style={{ textDecoration: "none" }}
              href={`/stashes/${stash.id}`}
            >
              <Button fullWidth>{stash.name}</Button>
            </Link>
          </Grid.Col>
        ))}
      </Grid>
    </Container>
  );
};

export default Stashes;
