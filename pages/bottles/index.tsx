import { authOptions } from "pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import { GetServerSideProps } from "next";
import prisma from "../../lib/prismadb";
import { Prisma } from "@prisma/client";

// next imports
import Link from "next/link";

// mantine imports
import { Container, Button, Grid, Group } from "@mantine/core";

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

  if (!session) {
    res.statusCode = 403;
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const bottles: BottleWithFullData[] = await prisma.bottle.findMany({
    where: {
      userId: session?.user?.id,
    },
    include: {
      product: {
        include: {
          brand: true,
        },
      },
    },
  });

  return {
    props: { bottles },
  };
};

type Props = {
  bottles: BottleWithFullData[];
};

const Bottles: React.FC<Props> = (props) => {
  return (
    <Container>
      <Group justify="space-between" h="100%" pl="10px" pt="10px">
        <Group>
          <h1>My Bottles</h1>
        </Group>
        <Group>
          {/*<Link href="/bottles/create">*/}
          {/*  <Button>Add Bottle</Button>*/}
          {/*</Link>*/}
          <Link href="/bottles/history">
            <Button>View History</Button>
          </Link>
        </Group>

      </Group>

      <Grid>
        {props.bottles
          .filter(function (bottle) {
            return bottle.finished != true;
          })
          .map((bottle) => (
            <Grid.Col span={{ base: 12, xs: 4 }} key={bottle.id}>
              <Link
                style={{ textDecoration: "none" }}
                href={`/bottles/${bottle.id}`}
              >
                <Button fullWidth>
                  {bottle.product.brand.name} {bottle.product.name}{" "}
                  {bottle.product.vintage}
                </Button>
              </Link>
            </Grid.Col>
          ))}
      </Grid>

      {/*<Group justify="space-between" h="100%" pl="10px" pt="10px">*/}
      {/*  <h1>My Finished Bottles</h1>*/}
      {/*</Group>*/}

      {/*<Grid>*/}
      {/*  {props.bottles*/}
      {/*    .filter(function (bottle) {*/}
      {/*      return bottle.finished == true;*/}
      {/*    })*/}
      {/*    .map((bottle) => (*/}
      {/*      <Grid.Col span={{ base: 12, xs: 4 }} key={bottle.id}>*/}
      {/*        <Link*/}
      {/*          style={{ textDecoration: "none" }}*/}
      {/*          href={`/bottles/${bottle.id}`}*/}
      {/*        >*/}
      {/*          <Button fullWidth>*/}
      {/*            {bottle.product.brand.name} {bottle.product.name}{" "}*/}
      {/*            {bottle.product.vintage}*/}
      {/*          </Button>*/}
      {/*        </Link>*/}
      {/*      </Grid.Col>*/}
      {/*    ))}*/}
      {/*</Grid>*/}
    </Container>
  );
};

export default Bottles;
