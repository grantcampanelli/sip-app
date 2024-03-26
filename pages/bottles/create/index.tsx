import React, { useState } from "react";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import prisma from "lib/prismadb";
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
import type { Bottle, Product, Brand } from "@prisma/client";

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

  const brandsDb: Brand[] = await prisma.brand.findMany({});
  const brandComboBox = brandsDb.map((brand) => {
    return { value: brand.id, label: brand.name };
  });

  const productsDb: Product[] = await prisma.product.findMany({
    // where: { brandId:  },
  });
  const productComboBox = productsDb.map((product) => {
    return { value: product.id, label: product.name };
  });

  return {
    props: { brandComboBox, productComboBox },
  };
};

type Props = {
  //   brands: Brand[];
  brandComboBox: ComboboxData;
  productComboBox: ComboboxData;
};
var productsFiltered: ComboboxData = [];

const CreateBottleForm: React.FC<Props> = (props) => {
  var productsFiltered: ComboboxData = props.productComboBox;

  const form = useForm({
    initialValues: {
      brandId: "",
      productId: "",
    },
    onValuesChange: (values) => {
      //   updateProductList(values.brandId);
    },
    // onValuesChange: (values) => {
    //   updateProductList(values.brandId);
    //   console.log("values: ", values);
    // },
  });

  const submitData = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    try {
      //   console.log("form.values: ", form.values);
      //   const body = {
      //     name: form.values.name,
      //     location: form.values.location,
      //     type: form.values.type,
      //   };
      //   console.log("body: ", body);
      //   await fetch("/api/bottles", {
      //     method: "POST",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify(body),
      //   });
      //   await Router.push("/bottles");
      console.log("submitData function");
    } catch (error) {
      console.error(error);
    }
  };
  //   const updateProductList = ({ target }) => {
  //     console.log("change brand: ", target.value);
  //   };

  return (
    <Container>
      <h1>Add Bottle</h1>
      <Box maw={340} mx="auto">
        <form onSubmit={form.onSubmit((values) => console.log(values))}>
          <Select
            label="Brand"
            placeholder="Justin"
            limit={5}
            data={props.brandComboBox}
            searchable
            {...form.getInputProps("brandId")}
          />

          <Select
            label="Product"
            placeholder="Isoceles"
            limit={5}
            data={productsFiltered}
            searchable
            {...form.getInputProps("productId")}
          />
          {/* <TextInput
            withAsterisk
            label="Name"
            placeholder="Red Wine Fridge"
            {...form.getInputProps("name")}
          />
          <TextInput
            withAsterisk
            label="Location"
            placeholder="Kitchen"
            {...form.getInputProps("location")}
          />
          <TextInput
            withAsterisk
            label="type"
            placeholder="fridge"
            {...form.getInputProps("type")}
          /> */}
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
