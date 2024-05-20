import { authOptions } from "pages/api/auth/[...nextauth]";
import { getSession, useSession } from "next-auth/react";
import { getServerSession } from "next-auth";
import { Bottle, Product, Brand, Prisma } from "@prisma/client";
import type { Session } from "inspector";
import { GetServerSideProps } from "next";
import prisma from "../../../../lib/prismadb";
import Link from "next/link";
import Router from "next/router";
import { modals } from "@mantine/modals";

import {
    Container,
    Button,
    Grid,
    Group,
    Text,
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
        shelfItem: {
            include: {
                shelf: {
                    include: {
                        stash: true;
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
                shelfItem: {
                    include: {
                        shelf: {
                            include: {
                                stash: true,
                            },
                        },
                    },
                },
            },
        })) || null;

    return {
        props: {
            bottle,
        },
    };
};

type Props = {
    bottle: BottleWithFullData;
};

const BottlePage: React.FC<Props> = (props) => {
    const form = useForm({
        // mode: 'uncontrolled',
        initialValues: {
            purchasePrice: props.bottle.purchasePrice,
        },
    });

    return (
        <Container>
            <h1>
                {props.bottle.product.brand.type == "WINE"
                    ? props.bottle.product.vintage
                    : null}{" "}
                {props.bottle.product.name}
            </h1>
            <form onSubmit={form.onSubmit((values) => console.log(values))}>

                <TextInput
                    label="Purchase Price"
                    key={"purchasePrice"}
                    value={props.bottle.purchasePrice || 0}
                />
                <Group justify="flex-end" mt="md">
                    <Button>Cancel</Button>
                    <Button type="submit">Save</Button>
                </Group>
            </form>
                {/*<strong>Purchase Price:</strong> {props.bottle.purchasePrice}*!/*/}
                {/*<Text>*/}
                {/*    {props.bottle.shelfItem ? (*/}
                {/*        <p>*/}
                {/*            <strong>Location:</strong>{" "}*/}
                {/*            {props.bottle.shelfItem.shelf.stash?.name}*/}
                {/*            {" | "}*/}
                {/*            <Link href={`/shelves/${props.bottle.shelfItem.shelf.id}`}>*/}
                {/*                {props.bottle.shelfItem.shelf.name}*/}
                {/*            </Link>*/}
                {/*        </p>*/}
                {/*    ) : null}*/}
                {/*</Text>*/}
                {/*<p>*/}
                {/*    <strong>Purchase Price:</strong> {props.bottle.purchasePrice}*/}
                {/*</p>*/}
                {/*{props.bottle.finished ? (*/}
                {/*    <p>*/}
                {/*        <strong>Finished Date:</strong> {String(props.bottle.finishDate)}*/}
                {/*    </p>*/}
                {/*) : null}*/}
                {/*<h3>Notes:</h3>*/}
                {/*<p>{props.bottle.notes}</p>*/}
                {/*<h3>Actions:</h3>*/}

        </Container>
);
};

export default BottlePage;
