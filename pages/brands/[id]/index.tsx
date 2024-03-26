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
  Table,
  ScrollArea,
  UnstyledButton,
  Text,
  Center,
  rem,
  keys,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import classes from "/styles/TableSort.module.css";
import { useState } from "react";
import {
  IconSelector,
  IconChevronDown,
  IconChevronUp,
  IconSearch,
} from "@tabler/icons-react";

type BrandWithFullData = Prisma.BrandGetPayload<{
  include: {
    products: true;
  };
}>;

type ProductFlatRow = {
  id: string;
  name: string;
  vintage: string;
};

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

  const productFlatRowData: ProductFlatRow[] =
    brand?.products.map((brand) => {
      return { id: brand.id, name: brand.name, vintage: brand.vintage };
    }) || [];

  return {
    props: {
      brand,
      productFlatRowData,
    },
  };
};

type Props = {
  brand: BrandWithFullData;
  productFlatRowData: ProductFlatRow[];
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

  /*
   *  Table Code
   */

  interface ProductRowData {
    id: string;
    name: string;
    vintage: string;
  }

  interface ThProps {
    children: React.ReactNode;
    reversed: boolean;
    sorted: boolean;
    onSort(): void;
  }

  function Th({ children, reversed, sorted, onSort }: ThProps) {
    const Icon = sorted
      ? reversed
        ? IconChevronUp
        : IconChevronDown
      : IconSelector;
    return (
      <Table.Th className={classes.th}>
        <UnstyledButton onClick={onSort} className={classes.control}>
          <Group justify="space-between">
            <Text fw={500} fz="sm">
              {children}
            </Text>
            <Center className={classes.icon}>
              <Icon style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
            </Center>
          </Group>
        </UnstyledButton>
      </Table.Th>
    );
  }
  function filterData(data: ProductRowData[], search: string) {
    const query = search.toLowerCase().trim();
    return data.filter((item) =>
      keys(data[0]).some((key) => item[key].toLowerCase().includes(query))
    );
  }

  function sortData(
    data: ProductRowData[],
    payload: {
      sortBy: keyof ProductRowData | null;
      reversed: boolean;
      search: string;
    }
  ) {
    const { sortBy } = payload;

    if (!sortBy) {
      return filterData(data, payload.search);
    }

    return filterData(
      [...data].sort((a, b) => {
        if (payload.reversed) {
          return b[sortBy].localeCompare(a[sortBy]);
        }

        return a[sortBy].localeCompare(b[sortBy]);
      }),
      payload.search
    );
  }
  const [search, setSearch] = useState("");
  const [sortedData, setSortedData] = useState(props.productFlatRowData);
  const [sortBy, setSortBy] = useState<keyof ProductRowData | null>(null);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);

  const setSorting = (field: keyof ProductRowData) => {
    const reversed = field === sortBy ? !reverseSortDirection : false;
    setReverseSortDirection(reversed);
    setSortBy(field);
    setSortedData(
      sortData(props.productFlatRowData, { sortBy: field, reversed, search })
    );
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;
    setSearch(value);
    setSortedData(
      sortData(props.productFlatRowData, {
        sortBy,
        reversed: reverseSortDirection,
        search: value,
      })
    );
  };

  const rows = sortedData.map((row) => (
    <Table.Tr key={row.name}>
      <Table.Td>{row.name}</Table.Td>
      <Table.Td>{row.vintage}</Table.Td>
      <Table.Td>
        <Link href={`/products/${row.id}`}>
          <Button>View</Button>
        </Link>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Container>
      <Group justify="space-between" h="100%" pl="10px" pt="10px">
        <h1>{props.brand.name}</h1>

        <Button onClick={open}>Add Product</Button>
      </Group>

      {/* {props.brand.products.map((product, index) => (
        <Link
          style={{ textDecoration: "none" }}
          href={`/products/${product.id}`}
          key={product.id}
        >
          <Button fullWidth>
            {product.vintage} {product.name}
          </Button>
        </Link>
      ))} */}

      <ScrollArea>
        <TextInput
          placeholder="Search by any field"
          mb="md"
          leftSection={
            <IconSearch
              style={{ width: rem(16), height: rem(16) }}
              stroke={1.5}
            />
          }
          value={search}
          onChange={handleSearchChange}
        />
        <Table
          horizontalSpacing="md"
          verticalSpacing="xs"
          miw={700}
          layout="fixed"
        >
          <Table.Tbody>
            <Table.Tr>
              <Th
                sorted={sortBy === "name"}
                reversed={reverseSortDirection}
                onSort={() => setSorting("name")}
              >
                Name
              </Th>
              <Th
                sorted={sortBy === "vintage"}
                reversed={reverseSortDirection}
                onSort={() => setSorting("vintage")}
              >
                Vintage
              </Th>
              <Th
                sorted={sortBy === "id"}
                reversed={reverseSortDirection}
                onSort={() => setSorting("id")}
              >
                Link
              </Th>
            </Table.Tr>
          </Table.Tbody>
          <Table.Tbody>
            {rows.length > 0 ? (
              rows
            ) : (
              <Table.Tr>
                <Table.Td
                  colSpan={Object.keys(props.productFlatRowData[0]).length}
                >
                  <Text fw={500} ta="center">
                    Nothing found
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>

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
