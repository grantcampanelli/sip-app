import { authOptions } from "pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import { Product, Prisma } from "@prisma/client";
import { GetServerSideProps } from "next";
import prisma from "../../../lib/prismadb";
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
import { DateTimePicker } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  query,
}) => {
  const session = await getServerSession(req, res, authOptions);

  console.log("id query parm: ", query);
  let productId: string = Array.isArray(query.id) ? "" : query.id || "";
  if (!session) {
    res.statusCode = 403;
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
  let product =
    (await prisma.product.findUnique({
      where: {
        id: productId,
      },
    })) || null;

  return {
    props: {
      product,
    },
  };
};

type Props = {
  product: Product;
};

const ProductPage: React.FC<Props> = (props) => {
  const [opened, { open, close }] = useDisclosure(false);
  const form = useForm({
    initialValues: {
      size: 25,
      servingSize: 9,
      purchasePrice: 19.99,
      purchaseDate: new Date(),
      openDate: null,
      finished: false,
      finishDate: null,
      amountRemaining: 100.0,
      notes: "",
    },
  });
  const submitData = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    try {
      const body = {
        size: form.values.size,
        servingSize: form.values.servingSize,
        purchasePrice: form.values.purchasePrice,
        purchaseDate: form.values.purchaseDate,
        openDate: form.values.openDate,
        finished: false,
        finishDate: null,
        amountRemaining: 100.0,
        notes: form.values.notes,
        productId: props.product.id,
        userIdInput: 
      };
      await fetch("/api/bottles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      // need to return back to right fridge page
      const url = "/bottles/";
      await Router.push(url);
      close();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Container>
      <Group justify="space-between" h="100%" pl="10px" pt="10px">
        <h1>
          {props.product.vintage} {props.product.name}
        </h1>

        <Button onClick={open}>Add To My Bottles</Button>
      </Group>
      <p>Varietal: {props.product.varietal}</p>

      <Modal opened={opened} onClose={close} title="Add Product">
        <Box maw={340} mx="auto">
          <form onSubmit={form.onSubmit((values) => console.log(values))}>
            <NumberInput
              withAsterisk
              label="Size in Ounces"
              placeholder="25"
              {...form.getInputProps("size")}
            />
            <NumberInput
              withAsterisk
              label="Serving Size in Ounces"
              placeholder="9"
              {...form.getInputProps("servingSize")}
            />
            <NumberInput
              withAsterisk
              label="Purchase Price"
              placeholder="20.00"
              {...form.getInputProps("purchasePrice")}
            />
            <DateTimePicker
              withAsterisk
              label="Purchase Date"
              placeholder="Pick a date"
              {...form.getInputProps("purchaseDate")}
            />
            <DateTimePicker
              label="Open Date"
              placeholder="Pick a date"
              {...form.getInputProps("openDate")}
            />
            <TextInput
              withAsterisk
              label="Notes"
              placeholder="This is a great wine"
              {...form.getInputProps("notes")}
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

export default ProductPage;
