import { authOptions } from "pages/api/auth/[...nextauth]";
import { getSession, useSession } from "next-auth/react";
import { getServerSession } from "next-auth";
import { Bottle, Product, Brand, Prisma } from "@prisma/client";
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
  //   const session = await getSession({ req });

  console.log("id query parm: ", query);
  let bottleId: string = Array.isArray(query.id) ? "" : query.id || "";
  if (!session) {
    res.statusCode = 403;

    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
  let bottle: Bottle | null = null;
  bottle =
    (await prisma.bottle.findUnique({
      where: {
        id: bottleId,
      },
      include: {
        product: {
          include: {
            brand: true,
          },
        },
      },
    })) || null;

  return {
    props: {
      bottle,
      // shelves: stash?.shelves
    },
  };
};

type Props = {
  bottle: BottleWithFullData;
  //   shelves: Shelf[];
};

const BottlePage: React.FC<Props> = (props) => {
  return (
    <Container>
      <h1>
        {props.bottle.product.vintage} {props.bottle.product.name}
      </h1>
      <h2>Notes: {props.bottle.notes}</h2>
    </Container>
  );
};

export default BottlePage;
