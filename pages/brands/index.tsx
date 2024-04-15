import { authOptions } from "pages/api/auth/[...nextauth]";
import { getSession, useSession } from "next-auth/react";
import { getServerSession } from "next-auth";
import type { Brand, Prisma } from "@prisma/client";
import type { Session } from "inspector";
import { GetServerSideProps } from "next";
import prisma from "../../lib/prismadb";
import {
  IconSelector,
  IconChevronDown,
  IconChevronUp,
  IconSearch,
} from "@tabler/icons-react";

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
  Select,
  Table,
  Divider,
  keys,
  rem,
  Center,
  Text,
  UnstyledButton,
  ScrollArea,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import classes from "/styles/TableSort.module.css";
import { useState } from "react";

type BrandWithFullData = Prisma.BrandGetPayload<{
  include: {
    products: true;
  };
}>;

type BrandFlatRow = {
  id: string;
  name: string;
  type: string;
};

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

  const brands: BrandWithFullData[] = await prisma.brand.findMany({
    include: {
      products: true,
    },
  });

  const brandFlatRowData: BrandFlatRow[] = brands.map((brand) => {
    return { id: brand.id, name: brand.name, type: brand.type };
  });

  return {
    props: { brands, brandFlatRowData },
  };
};

type Props = {
  brands: BrandWithFullData[];
  brandFlatRowData: BrandFlatRow[];
};

const Brands: React.FC<Props> = (props) => {
  /*
   *   Modal Code
   */
  const [opened, { open, close }] = useDisclosure(false);
  const form = useForm({
    initialValues: {
      name: "",
      type: "WINE",
    },
  });

  const submitData = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    try {
      const body = {
        name: form.values.name,
        type: form.values.type,
      };
      await fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      await Router.reload();
      close();
    } catch (error) {
      console.error(error);
    }
  };

  /*
   *  Table Code
   */

  interface BrandRowData {
    id: string;
    name: string;
    type: string;
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
  function filterData(data: BrandRowData[], search: string) {
    const query = search.toLowerCase().trim();
    return data.filter((item) =>
      keys(data[0]).some((key) => item[key].toLowerCase().includes(query))
    );
  }

  function sortData(
    data: BrandRowData[],
    payload: {
      sortBy: keyof BrandRowData | null;
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
  const [sortedData, setSortedData] = useState(props.brandFlatRowData);
  const [sortBy, setSortBy] = useState<keyof BrandRowData | null>(null);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);

  const setSorting = (field: keyof BrandRowData) => {
    const reversed = field === sortBy ? !reverseSortDirection : false;
    setReverseSortDirection(reversed);
    setSortBy(field);
    setSortedData(
      sortData(props.brandFlatRowData, { sortBy: field, reversed, search })
    );
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;
    setSearch(value);
    setSortedData(
      sortData(props.brandFlatRowData, {
        sortBy,
        reversed: reverseSortDirection,
        search: value,
      })
    );
  };

  const rows = sortedData.map((row) => (
    <Table.Tr key={row.name}>
      <Table.Td>{row.name}</Table.Td>
      <Table.Td>{row.type}</Table.Td>
      <Table.Td>
        <Link href={`/brands/${row.id}`}>
          <Button>View</Button>
        </Link>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Container>
      <Group justify="space-between" h="100%" pl="10px" pt="10px">
        <h1>Brands</h1>
        <Button onClick={open}>Add Brand</Button>
      </Group>

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
                sorted={sortBy === "type"}
                reversed={reverseSortDirection}
                onSort={() => setSorting("type")}
              >
                Type
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
                  colSpan={
                    props.brandFlatRowData[0] &&
                    Object.keys(props.brandFlatRowData[0]).length
                  }
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

      <Modal opened={opened} onClose={close} title="Add Brand">
        <Box maw={340} mx="auto">
          <form onSubmit={form.onSubmit((values) => console.log(values))}>
            <TextInput
              withAsterisk
              label="Name"
              placeholder="Justin"
              {...form.getInputProps("name")}
            />
            <Select
              withAsterisk
              label="Type"
              placeholder="Select type"
              data={[
                { label: "Wine", value: "WINE" },
                { label: "Spirits", value: "SPIRIT" },
                { label: "Beer", value: "BEER" },
              ]}
              {...form.getInputProps("type")}
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
