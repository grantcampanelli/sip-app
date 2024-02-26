import { authOptions } from "pages/api/auth/[...nextauth]";
import { getSession, useSession } from "next-auth/react";
import { getServerSession } from "next-auth";
import { Stash, Shelf, ShelfItem, Bottle, Prisma } from "@prisma/client";
import type { Session } from "inspector";
import { GetServerSideProps } from "next";
import prisma from "../../../lib/prismadb";
import Link from "next/link";
import Router from "next/router";

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
  //   shelves: Shelf[];
};

const Stashes: React.FC<Props> = (props) => {
  //   console.log("shelves: ", props.shelves);
  const [opened, { open, close }] = useDisclosure(false);
  const form = useForm({
    initialValues: {
      name: "",
      order: "",
      capacity: 0,
      temp: 0.0,
      stashId: "",
    },
    // validate: {
    //   email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
    // },
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

  return (
    <Container>
      <Group justify="space-between" h="100%" pl="10px" pt="10px">
        <h1>{props.stash.name}</h1>

        {/* <Link href={`/stashes/${props.stash.id}/createShelf`}> */}
        <Button onClick={open}>Create Shelf</Button>
        {/* </Link> */}
      </Group>

      {props.stash.shelves.map((shelf, index) => (
        <Link style={{ textDecoration: "none" }} href={`/shelves/${shelf.id}`}>
          <Button fullWidth>Shelf {index + 1}</Button>
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
    </Container>
  );
};

export default Stashes;
