import { authOptions } from "pages/api/auth/[...nextauth]";
import { getSession, useSession } from "next-auth/react";
import { getServerSession } from "next-auth";
import type { Brand, Prisma } from "@prisma/client";
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
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";

// type BottleWithFullData = Prisma.BottleGetPayload<{
//   include: {
//     product: {
//       include: {
//         brand: true;
//       };
//     };
//   };
// }>;

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

  const brands: Brand[] = await prisma.brand.findMany({});

  return {
    props: { brands },
  };
};

type Props = {
  brands: Brand[];
};

const Brands: React.FC<Props> = (props) => {
  console.log("props: ", props);
  const [opened, { open, close }] = useDisclosure(false);
  const form = useForm({
    initialValues: {
      name: "",
    },
  });

  const submitData = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    try {
      const body = {
        name: form.values.name,
      };
      await fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      await Router.push("/brands/");
      close();
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <Container>
      <Group justify="space-between" h="100%" pl="10px" pt="10px">
        <h1>Brands</h1>
        <Button onClick={open}>Add Brand</Button>
      </Group>

      <Grid>
        {props.brands.map((brand) => (
          <Grid.Col span={{ base: 12, xs: 4 }} key={brand.id}>
            <Link
              style={{ textDecoration: "none" }}
              href={`/brands/${brand.id}`}
            >
              <Button fullWidth>{brand.name}</Button>
            </Link>
          </Grid.Col>
        ))}
      </Grid>

      <Modal opened={opened} onClose={close} title="Create Shelf">
        <Box maw={340} mx="auto">
          <form onSubmit={form.onSubmit((values) => console.log(values))}>
            <TextInput
              withAsterisk
              label="Name"
              placeholder="Justin"
              {...form.getInputProps("name")}
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

export default Brands;
