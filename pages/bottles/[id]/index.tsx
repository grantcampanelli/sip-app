import {authOptions} from "pages/api/auth/[...nextauth]";
import {getSession, useSession} from "next-auth/react";
import {getServerSession} from "next-auth";
import {Bottle, Product, Brand, Prisma} from "@prisma/client";
import type {Session} from "inspector";
import {GetServerSideProps} from "next";
import prisma from "../../../lib/prismadb";
import Link from "next/link";
import Router from "next/router";
import {modals} from "@mantine/modals";

import {
    Container,
    Button,
    Grid,
    Group,
    Text,
    Modal,
    Box,
    TextInput,
    NumberInput, Card,
} from "@mantine/core";
import {useDisclosure} from "@mantine/hooks";
import {useForm} from "@mantine/form";

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

async function deleteShelfItem(id: string): Promise<void> {
    await fetch(`/api/shelfItems/${id}`, {
        method: "DELETE",
    });
    Router.reload();

}

async function markBottleAsfinished(id: string): Promise<void> {
    await fetch(`/api/bottles/${id}/finish`, {
        method: "POST",
    });
    Router.reload();
}


const BottlePage: React.FC<Props> = (props) => {

    const bottleActionButtons = ({bottleId, shelfItemId, isFinished}: {
        bottleId: string,
        shelfItemId: string,
        isFinished: boolean
    }) => {
        if (isFinished) {
            return (
                <Button

                    component={Link}
                    href={`/bottles/${props.bottle.id}/edit`}
                >
                    Edit</Button>
            )
        }


    }

    const removeFromShelf = ({shelfItemId}: { shelfItemId: string }) => {
        return (<Button
            onClick={() =>
                modals.openConfirmModal({
                    title: "Do you want to remove this bottle from your stash?",
                    children: (
                        <Text size="sm">
                            This will remove this bottle from your shelf, but it will
                            not mark it as finished.
                        </Text>
                    ),
                    labels: {confirm: "Confirm", cancel: "Cancel"},
                    onCancel: () => console.log("Cancel"),
                    onConfirm: () => (
                        deleteShelfItem(shelfItemId),
                            console.log("Deleted shelf item ")
                    ),
                })
            }
        >
            Remove from Shelf
        </Button>)
    }

    const addToShelf = ({bottleId}: { bottleId: string }) => {
        return (<Button

            onClick={() =>
                modals.openConfirmModal({
                    title: "Under Construction...",
                    children: <Text size="sm">You can add bottles to the shelves from the shelves
                        directly</Text>,
                    labels: {confirm: "Confirm", cancel: "Cancel"},
                    onCancel: () => console.log("Cancel"),
                    onConfirm: () => console.log("Confirm")

                    // title: "Which shelf do you want to add it to?",
                    // children: <Text size="sm">Search for shelf</Text>,
                    // labels: { confirm: "Confirm", cancel: "Cancel" },
                    // onCancel: () => console.log("Cancel"),
                    // onConfirm: () =>
                    //   // deleteShelfItem(props.bottle.shelfItem?.id || ""),
                    //   console.log("Added to shelf"),
                })
            }
        >
            Add to Shelf
        </Button>)
    }

    return (
        <Container>
            <Group justify={"space-between"}>
                <h1>
                    {props.bottle.product.brand.type == "WINE"
                        ? props.bottle.product.vintage
                        : null}{" "}
                    {props.bottle.product.name}
                </h1>
                <Group>


                    {props.bottle.shelfItem && !props.bottle.finished ? (
                        removeFromShelf({shelfItemId: props.bottle.shelfItem?.id || ""})
                    ) : null}
                    {!props.bottle.shelfItem && !props.bottle.finished ? (
                        addToShelf({bottleId: props.bottle.id || ""})
                    ) : null}
                    {props.bottle.finished ? null : (
                        <Button
                            onClick={() =>
                                modals.openConfirmModal({
                                    title: "Do you want to make this bottle as finished?",
                                    children: (
                                        <Text size="sm">
                                            This will mark the bottle as finished. You should have
                                            already removed it from the shelf.
                                        </Text>
                                    ),
                                    labels: {confirm: "Confirm", cancel: "Cancel"},
                                    onCancel: () => console.log("Cancel"),
                                    onConfirm: () => (
                                        markBottleAsfinished(props.bottle.id || ""),
                                            console.log("Marked bottle as finished")
                                    ),
                                })
                            }
                        >
                            Mark Finished
                        </Button>
                    )}
                    <Button component={Link} href={`/bottles/${props.bottle.id}/edit`}>Edit</Button>
                    {props.bottle.finished ? (
                        <Button component={Link} href={`/bottles/history`}>All Finished Bottles</Button>
                    ) : <Button component={Link} href={`/bottles/`}>Back</Button>}

                </Group>
            </Group>

            <Text>
                {props.bottle.shelfItem ? (
                    <p>
                        <strong>Location:</strong>{" "}
                        {props.bottle.shelfItem.shelf.stash?.name}
                        {" | "}
                        <Link href={`/shelves/${props.bottle.shelfItem.shelf.id}`}>
                            {props.bottle.shelfItem.shelf.name}
                        </Link>
                    </p>
                ) : null}
            </Text>

            <p><strong>Purchase Price:</strong> ${props.bottle.purchasePrice}</p>
            <p><strong>Purchase Date:</strong> {props.bottle.purchaseDate?.toLocaleDateString()}</p>
            <p><strong>Notes: </strong>{props.bottle.notes}</p>
            <p><strong>Amount Remaining:</strong> {props.bottle.amountRemaining}%</p>
            {props.bottle.finished ? (<p><strong>Finished Date:</strong> {String(props.bottle.finishDate)}</p>) : null}
        </Container>
    );
};

export default BottlePage;
