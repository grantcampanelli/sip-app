import {authOptions} from "pages/api/auth/[...nextauth]";
import {getSession, useSession} from "next-auth/react";
import {getServerSession} from "next-auth";
import {Stash, Shelf, ShelfItem, Bottle, Prisma} from "@prisma/client";
import type {Session} from "inspector";
import {GetServerSideProps} from "next";
import prisma from "../../../lib/prismadb";
import Link from "next/link";
import {Container, Button, Grid, Group, Divider, Table, Card, Text, ActionIcon, Tooltip} from "@mantine/core";
import {IconCircleArrowLeft, IconEdit, IconSquarePlus} from "@tabler/icons-react";

type ShelfWithBottles = Prisma.ShelfGetPayload<{
    include: {
        shelfItems: {
            include: {
                bottle: {
                    include: {
                        product: {
                            include: {
                                brand: true;
                            };
                        };
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
    let shelfId: string = Array.isArray(query.id) ? "" : query.id || "";
    if (!session) {
        res.statusCode = 403;

        return {
            redirect: {
                destination: "/",
                permanent: false,
            },
        };
    }
    let shelf: ShelfWithBottles | null = null;
    shelf =
        (await prisma.shelf.findUnique({
            where: {
                id: shelfId,
            },
            include: {
                shelfItems: {
                    include: {
                        bottle: {
                            include: {
                                product: {
                                    include: {
                                        brand: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        })) || null;

    return {
        props: {
            shelf,
        },
    };
};

type Props = {
    shelf: ShelfWithBottles;
};

const ShelfItems: React.FC<Props> = (props) => {

    return (
        <Container>
            <Group justify="space-between">
                <Group>
                    <ActionIcon
                        component={Link}
                        href={`/stashes/${props.shelf.stashId}`}
                        mr={5}
                        size={"lg"}
                    >
                        <IconCircleArrowLeft/>
                    </ActionIcon>
                    <h1>{props.shelf.name}</h1>
                </Group>

                <Group>
                <Tooltip label={"Add Bottle"} position={"left"}><ActionIcon color={"green"} size={"lg"} component={Link}
                                                                            href={`/shelves/${props.shelf.id}/addBottle`}>
                    <IconSquarePlus/></ActionIcon></Tooltip>
                <Tooltip label={"Edit Shelf"} position={"left"}><ActionIcon color={"yellow"} size={"lg"} component={Link}
                                                                            href={`/shelves/${props.shelf.id}/edit`}>
                    <IconEdit/></ActionIcon></Tooltip>
                </Group>
            </Group>
            {props.shelf.shelfItems

                .map((row) => (

                    <Card
                        key={row.id}
                        shadow="sm"
                        padding="md"
                        radius="md"
                        pt={20}
                        mt={5}
                        withBorder>
                        <Card.Section>
                            <Link
                                style={{textDecoration: "none"}}
                                href={`/bottles/${row.bottle.id}`}
                            >
                                <Text
                                    size="lg"
                                    fw={800}
                                    ta="left"
                                    pl={20}
                                    pr={20}
                                    variant="gradient"
                                    gradient={{from: "red", to: "maroon", deg: 90}}

                                >
                                    {row.bottle.product.brand.name} {row.bottle.product.name} {row.bottle.product.vintage}
                                </Text>
                                <Text
                                    size="sm"
                                    fw={800}
                                    ta="left"
                                    pl={20}
                                    pr={20}
                                    variant="gradient"
                                    gradient={{from: "red", to: "maroon", deg: 90}}
                                >
                                    Purchase Date: {row.bottle.purchaseDate
                                    ? row.bottle.purchaseDate.toLocaleDateString()
                                    : null}
                                </Text>
                            </Link>
                        </Card.Section>
                    </Card>
                ))}
        </Container>
    );
};

export default ShelfItems;
