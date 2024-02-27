import { authOptions } from "pages/api/auth/[...nextauth]";
import { getSession, useSession } from "next-auth/react";
import { getServerSession } from "next-auth";
import type { Bottle, Prisma } from "@prisma/client";
import type { Session } from "inspector";
import { GetServerSideProps } from "next";
import prisma from "../../lib/prismadb";

// next imports
import Link from "next/link";
import Router from "next/router";

// mantine imports
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
// import { useDisclosure } from "@mantine/hooks";
//import { useForm } from "@mantine/form";

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

  console.log("getting bottles!!");

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

  console.log("BottleWithFullData: ", bottles);

  return {
    props: { bottles },
  };
};

type Props = {
  bottles: BottleWithFullData[];
};

const Bottles: React.FC<Props> = (props) => {
  console.log("props: ", props);
  // const [opened, { open, close }] = useDisclosure(false);
  // const form = useForm({
  //   initialValues: {
  //     name: "",
  //     order: "",
  //     capacity: 0,
  //     temp: 0.0,
  //     stashId: "",
  //   },
  //   // validate: {
  //   //   email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
  //   // },
  // });

  // const submitData = async (e: React.SyntheticEvent) => {
  //   e.preventDefault();

  //   try {
  //     const body = {
  //       name: form.values.name,
  //       order: form.values.order,
  //       capacity: form.values.capacity,
  //       temp: form.values.temp,
  //       stashId: props.stash.id,
  //     };
  //     await fetch("/api/bottles", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(body),
  //     });
  //     // need to return back to right fridge page
  //     // const url = "/stashes/" + props.stash.id;
  //     await Router.push("/bottles/");
  //     close();
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };
  return (
    <Container>
      <Group justify="space-between" h="100%" pl="10px" pt="10px">
        <h1>My Unfinished Bottles</h1>

        {/* <Link href="/bottles/create">
          <Button>Add Bottle</Button>
        </Link> */}
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

      <Group justify="space-between" h="100%" pl="10px" pt="10px">
        <h1>My Finished Bottles</h1>
      </Group>

      <Grid>
        {props.bottles
          .filter(function (bottle) {
            return bottle.finished == true;
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

      {/* <Modal opened={opened} onClose={close} title="Create Shelf">
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
      </Modal> */}
    </Container>
  );
};

export default Bottles;
