import { authOptions } from "pages/api/auth/[...nextauth]";
import { getSession, useSession } from "next-auth/react";
import { getServerSession } from "next-auth";
import { Stash, Shelf, ShelfItem, Bottle, Prisma } from "@prisma/client";
import type { Session } from "inspector";
import { GetServerSideProps } from "next";
import prisma from "../../../lib/prismadb";
import Link from "next/link";
import Router from "next/router";
import { Divider, rem, Text } from "@mantine/core";
import { useListState } from "@mantine/hooks";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { IconGripVertical } from "@tabler/icons-react";
import classes from "/styles/DndListHandle.module.css";
import cx from "clsx";

import {
  Container,
  Button,
  Grid,
  Group,
  Modal,
  Box,
  TextInput,
  NumberInput,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";

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
};

const Stashes: React.FC<Props> = (props) => {
  const [opened, { open, close }] = useDisclosure(false);
  const form = useForm({
    initialValues: {
      name: "",
      order: "",
      capacity: 0,
      temp: 0.0,
      stashId: "",
    },
  });
  const submitData = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    try {
      const body = {
        name: form.values.name,
        order: form.values.order,
        capacity: form.values.capacity,
        temp: form.values.temp,
        stashId: props.stash.id,
      };
      await fetch("/api/shelves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      // need to return back to right fridge page
      const url = "/stashes/" + props.stash.id;
      await Router.push(url);
      close();
    } catch (error) {
      console.error(error);
    }
  };

  const [state, handlers] = useListState(props.stash.shelves);

  const items = state.map((item, index) => (
    <Draggable key={item.name} index={index} draggableId={item.name}>
      {(provided, snapshot) => (
        <div
          className={cx(classes.item, {
            [classes.itemDragging]: snapshot.isDragging,
          })}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
        >
          <div>
            <Group justify="space-between" h="100%" pl="10px" pt="10px">
              <Text>{item.name}</Text>
              <Text c="dimmed" size="sm">
                Capacity: {item.capacity} - Contains: {item.shelfItems.length}
              </Text>
              <Link
                key={item.id}
                style={{ textDecoration: "none" }}
                href={`/shelves/${item.id}`}
              >
                <Button fullWidth>Open Shelf</Button>
              </Link>
            </Group>
          </div>
        </div>
      )}
    </Draggable>
  ));

  return (
    <Container>
      <Group justify="space-between" h="100%" pl="10px" pt="10px">
        <h1>{props.stash.name}</h1>

        {/* <Link href={`/stashes/${props.stash.id}/createShelf`}> */}
        <Button onClick={open}>Create Shelf</Button>
        {/* </Link> */}
      </Group>

      {props.stash.shelves.map((shelf, index) => (
        <Link
          key={shelf.id}
          style={{ textDecoration: "none" }}
          href={`/shelves/${shelf.id}`}
        >
          <Button fullWidth>{shelf.name}</Button>
        </Link>
      ))}

      <Modal opened={opened} onClose={close} title="Create Shelf">
        <Box maw={340} mx="auto">
          <form onSubmit={form.onSubmit((values) => console.log(values))}>
            <TextInput
              withAsterisk
              label="Name"
              placeholder="1st Shelf"
              {...form.getInputProps("name")}
            />
            <NumberInput
              withAsterisk
              label="Order"
              placeholder="1"
              {...form.getInputProps("order")}
            />
            <NumberInput
              withAsterisk
              label="Capacity"
              placeholder="5"
              {...form.getInputProps("capacity")}
            />
            <NumberInput
              withAsterisk
              label="Temperature"
              placeholder="5"
              {...form.getInputProps("temp")}
            />
            <Group justify="flex-end" mt="md">
              <Button type="submit" onClick={submitData}>
                Submit
              </Button>
            </Group>
          </form>
        </Box>
      </Modal>

      <Divider my="md" />
      <Group>
        <h1>Coming Soon... Drag and Drop Ordering</h1>
        <Button>Save Order</Button>
      </Group>
      <DragDropContext
        onDragEnd={({ destination, source }) =>
          handlers.reorder({ from: source.index, to: destination?.index || 0 })
        }
      >
        <Droppable droppableId="dnd-list" direction="vertical">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {items}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </Container>
  );
};

export default Stashes;
