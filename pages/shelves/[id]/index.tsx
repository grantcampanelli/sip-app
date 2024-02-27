import { authOptions } from "pages/api/auth/[...nextauth]";
import { getSession, useSession } from "next-auth/react";
import { getServerSession } from "next-auth";
import { Stash, Shelf, ShelfItem, Bottle, Prisma } from "@prisma/client";
import type { Session } from "inspector";
import { GetServerSideProps } from "next";
import prisma from "../../../lib/prismadb";
import Link from "next/link";
import { Container, Button, Grid, Group, Divider, Table } from "@mantine/core";
import { rem } from "@mantine/core";
// import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useListState } from "@mantine/hooks";
import { IconGripVertical } from "@tabler/icons-react";
import classes from "/styles/DndListHandle.module.css";

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
  console.log("shelfItems props:", props);
  const [state, handlers] = useListState(props.shelf.shelfItems);

  const items = state.map((item, index) => (
    <Draggable key={item.id} index={index} draggableId={item.id}>
      {(provided) => (
        <Table.Tr
          className={classes.item}
          ref={provided.innerRef}
          {...provided.draggableProps}
        >
          <Table.Td>
            <div className={classes.dragHandle} {...provided.dragHandleProps}>
              <IconGripVertical
                style={{ width: rem(18), height: rem(18) }}
                stroke={1.5}
              />
            </div>
          </Table.Td>
          <Table.Td style={{ width: rem(80) }}>
            {item.bottle.product.name}
          </Table.Td>
          <Table.Td style={{ width: rem(120) }}>
            <Link href={"/blah"}>
              <Button>View</Button>
            </Link>
          </Table.Td>
          <Table.Td style={{ width: rem(80) }}>
            <Link href={"/blah"}>
              <Button>Delete</Button>
            </Link>
          </Table.Td>
          <Table.Td>{item.mass}</Table.Td>
        </Table.Tr>
      )}
    </Draggable>
  ));

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

      <Divider />
      <h1>Drag & Drop Table Coming Soon</h1>
      <Table.ScrollContainer minWidth={420}>
        <DragDropContext
          onDragEnd={({ destination, source }) =>
            handlers.reorder({
              from: source.index,
              to: destination?.index || 0,
            })
          }
        >
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ width: rem(40) }} />
                <Table.Th style={{ width: rem(80) }}>Name</Table.Th>
                <Table.Th style={{ width: rem(120) }}>View</Table.Th>
                <Table.Th style={{ width: rem(40) }}>Delete</Table.Th>
                <Table.Th>Mass</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Droppable droppableId="dnd-list" direction="vertical">
              {(provided) => (
                <Table.Tbody
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {items}
                  {provided.placeholder}
                </Table.Tbody>
              )}
            </Droppable>
          </Table>
        </DragDropContext>
      </Table.ScrollContainer>
    </Container>
  );
};

export default ShelfItems;
