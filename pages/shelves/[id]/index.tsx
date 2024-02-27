import { authOptions } from "pages/api/auth/[...nextauth]";
import { getSession, useSession } from "next-auth/react";
import { getServerSession } from "next-auth";
import { Stash, Shelf, ShelfItem, Bottle, Prisma } from "@prisma/client";
import type { Session } from "inspector";
import { GetServerSideProps } from "next";
import prisma from "../../../lib/prismadb";
import Link from "next/link";
import { Container, Button, Grid, Group } from "@mantine/core";

type ShelfWithBottles = Prisma.ShelfGetPayload<{
  include: {
    shelfItems: {
      include: {
        bottle: {
          include: {
            product: {
              include: {
                brand: true;
              };
            };
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
  let shelfId: string = Array.isArray(query.id) ? "" : query.id || "";
  if (!session) {
    res.statusCode = 403;
    console.log("checking session and not finding it in shelf:", session);

    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
  let shelf: ShelfWithBottles | null = null;
  shelf =
    (await prisma.shelf.findUnique({
      where: {
        id: shelfId,
      },
      include: {
        shelfItems: {
          include: {
            bottle: {
              include: {
                product: {
                  include: {
                    brand: true,
                  },
                },
              },
            },
          },
        },
      },
    })) || null;
  console.log("stashID for shelf:", shelf);

  return {
    props: {
      shelf,
    },
  };
};

type Props = {
  shelf: ShelfWithBottles;
};

const ShelfItems: React.FC<Props> = (props) => {
  return (
    <Container>
      <Group justify="space-between" h="100%" pl="10px" pt="10px">
        <h1>Shelf {props.shelf.order}</h1>

        <Link
          href={`/shelves/${props.shelf.id}/addBottle`}
          style={{ textDecoration: "none" }}
        >
          <Button>Add Bottle</Button>
        </Link>
      </Group>

      <Grid>
        {props.shelf.shelfItems.map((shelfItem, index) => (
          <Grid.Col span={{ base: 12, xs: 4 }} key={shelfItem.id}>
            <Link
              href={`/bottles/${shelfItem.bottle.id}`}
              style={{ textDecoration: "none" }}
            >
              <Button fullWidth>
                {shelfItem.bottle.product.vintage}{" "}
                {shelfItem.bottle.product.name}
              </Button>
            </Link>
          </Grid.Col>
        ))}
      </Grid>
    </Container>
  );
};

export default ShelfItems;
