import React, { useState } from "react";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import prisma from "lib/prismadb";
import Link from "next/link";
import { authOptions } from "pages/api/auth/[...nextauth]";
import Router from "next/router";
import {
  Container,
  Button,
  Input,
  Textarea,
  Box,
  TextInput,
  NumberInput,
  Checkbox,
  Group,
  Select,
  ComboboxData,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import type { Bottle, Product, Prisma } from "@prisma/client";

type BottleWithFullData = Prisma.BottleGetPayload<{
  include: {
    product: {
      include: {
        brand: true;
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

  const shelfId: string = Array.isArray(query.id) ? "" : query.id || "";
  if (!session) {
    res.statusCode = 403;
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const usersBottles: BottleWithFullData[] = await prisma.bottle.findMany({
    where: { userId: session?.user?.id, shelfItem: null, finished: false },
    include: {
      product: {
        include: {
          brand: true,
        },
      },
    },
  });

  const usersBottlesComboBox = usersBottles.map((bottle) => {
    return {
      value: bottle.id,
      label:
        bottle.product.brand.name +
        " " +
        bottle.product.name +
        " " +
        bottle.product.vintage,
    };
  });

  return {
    props: {
      usersBottlesComboBox,
      shelfId,
    },
  };
};

type Props = {
  usersBottlesComboBox: ComboboxData;
  shelfId: string;
};
var productsFiltered: ComboboxData = [];

const CreateBottleForm: React.FC<Props> = (props) => {
  const form = useForm({
    initialValues: {
      bottleId: "",
      shelfId: props.shelfId,
      order: 1,
    },
  });

  const submitData = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    try {
      const body = {
        bottleId: form.values.bottleId,
        shelfId: props.shelfId,
        order: form.values.order,
      };
      await fetch("/api/shelfItems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const url = "/shelves/" + props.shelfId;
      await Router.push(url);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Container>
      <h1>Add Bottle</h1>
      <Box maw={340} mx="auto">
        <h4>
          You can add bottles to your shelf once you have added your bottle to
          your collection. You can do this by browsing the catalog{" "}
          <Link href="/brands">here</Link>.
        </h4>
        <form onSubmit={form.onSubmit((values) => console.log(values))}>
          <Select
            label="Bottle"
            placeholder="Justin"
            limit={5}
            data={props.usersBottlesComboBox}
            searchable
            {...form.getInputProps("bottleId")}
          />
          <NumberInput
            withAsterisk
            label="Order"
            placeholder="1"
            {...form.getInputProps("order")}
          />
          <Group justify="flex-end" mt="md">
            <Button type="submit" onClick={submitData}>
              Submit
            </Button>
          </Group>
        </form>
      </Box>
    </Container>
  );
};

export default CreateBottleForm;
