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

type BrandWithFullData = Prisma.BrandGetPayload<{
  include: {
    products: true;
  };
}>;

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  query,
}) => {
  const session = await getServerSession(req, res, authOptions);

  console.log("id query parm: ", query);
  let brandId: string = Array.isArray(query.id) ? "" : query.id || "";
  if (!session) {
    res.statusCode = 403;
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
  let brand: BrandWithFullData | null = null;
  brand =
    (await prisma.brand.findUnique({
      where: {
        id: brandId,
      },
      include: {
        products: true,
      },
    })) || null;

  return {
    props: {
      brand,
    },
  };
};

type Props = {
  brand: BrandWithFullData;
};

const Brand: React.FC<Props> = (props) => {
  const [opened, { open, close }] = useDisclosure(false);
  const form = useForm({
    initialValues: {
      name: "",
      vintage: "",
      varietal: "",
    },
  });
  const submitData = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    try {
      const body = {
        name: form.values.name,
        vintage: form.values.vintage,
        varietal: form.values.varietal,
        brandId: props.brand.id,
      };
      await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      // need to return back to right fridge page
      const url = "/brands/" + props.brand.id;
      await Router.push(url);
      close();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Container>
      <Group justify="space-between" h="100%" pl="10px" pt="10px">
        <h1>{props.brand.name}</h1>

        <Button onClick={open}>Add Product</Button>
      </Group>

      {props.brand.products.map((product, index) => (
        <Link
          style={{ textDecoration: "none" }}
          href={`/products/${product.id}`}
        >
          <Button fullWidth>
            {product.vintage} {product.name}
          </Button>
        </Link>
      ))}

      <Modal opened={opened} onClose={close} title="Add Product">
        <Box maw={340} mx="auto">
          <form onSubmit={form.onSubmit((values) => console.log(values))}>
            <TextInput
              withAsterisk
              label="Name"
              placeholder="Justification"
              {...form.getInputProps("name")}
            />
            <TextInput
              withAsterisk
              label="Vintage"
              placeholder="2016"
              {...form.getInputProps("vintage")}
            />
            <TextInput
              withAsterisk
              label="Varietal"
              placeholder="Cabernet Sauvignon"
              {...form.getInputProps("varietal")}
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

export default Brand;
