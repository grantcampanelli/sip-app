import {authOptions} from "pages/api/auth/[...nextauth]";
import {getSession, useSession} from "next-auth/react";
import {getServerSession} from "next-auth";
import {Bottle, Product, Brand, Prisma} from "@prisma/client";
import {GetServerSideProps} from "next";
import prisma from "../../../lib/prismadb";
import Link from "next/link";
import Router from "next/router";
import {modals} from "@mantine/modals";

import {
    Container,
    Button,
    Group,
    Text, ActionIcon, Tooltip, Menu
} from "@mantine/core";
import {
    IconCircleArrowLeft,
    IconTrash,
    IconEdit,
    IconCheckbox,
    IconSquarePlus,
    IconSquareX,
    IconDotsCircleHorizontal
} from '@tabler/icons-react';

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

async function deleteBottle(id: string): Promise<void> {
    await fetch(`/api/bottles/${id}`, {
        method: "DELETE",
    });
    Router.push("/bottles");
    // Router.reload();
}


const BottlePage: React.FC<Props> = (props) => {

    const bottleActionButtons = ({bottleId, shelfItemId, isFinished}: {
        bottleId: string,
        shelfItemId: string,
        isFinished: boolean
    }) => {
        if (isFinished) {
            return (
                <ActionIcon component={Link} href={`/bottles/${props.bottle.id}/edit`} mr={5}><IconEdit/></ActionIcon>

                // <Button
                //
                //         component={Link}
                //         href={`/bottles/${props.bottle.id}/edit`}
                //     >
                //         Edit</Button>
            )
        }


    }

    const openRemoveFromShelfModal = ({shelfItemId}: { shelfItemId: string }) => {
        return (

            <Menu.Item
                leftSection={<IconSquareX/>}
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
                }> Remove from Shelf
            </Menu.Item>)
    }

    const openAddToShelfModal = ({bottleId}: { bottleId: string }) => {
        return (

            <Menu.Item
                leftSection={<IconSquarePlus/>}

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
                }> Add to Shelf

            </Menu.Item>)
    }

    const openDeleteModal = ({bottleId}: { bottleId: string }) => {
        return (
            <Menu.Item
                leftSection={<IconTrash/>}
                color="red"
                onClick={() =>
                    modals.openConfirmModal({
                        title: "Do you want to delete this bottle?",
                        children: (
                            <Text size="sm">
                                This cannot be undone.
                            </Text>
                        ),
                        labels: {confirm: "Confirm", cancel: "Cancel"},
                        onCancel: () => console.log("Cancel"),
                        onConfirm: () => (
                            deleteBottle(bottleId),
                                console.log("Deleted Bottle")
                        ),
                    })
                }> Delete </Menu.Item>)
    }

    const openFinishModal = ({bottleId}: { bottleId: string }) => {
        return (
            <Menu.Item
                leftSection={<IconCheckbox/>}

                onClick={() =>
                    modals.openConfirmModal({
                        title: "Do you want to mark this bottle as finished?",
                        children: (
                            <Text size="sm">
                                This will mark the bottle as finished. You should have
                                already removed it from the shelf.
                            </Text>
                        ),
                        labels: {confirm: "Confirm", cancel: "Cancel"},
                        onCancel: () => console.log("Cancel"),
                        onConfirm: () => (
                            markBottleAsfinished(bottleId),
                                console.log("Marked bottle as finished")
                        ),
                    })
                }
            > Mark Bottle as Finished
            </Menu.Item>)
    }

    const openEditBottle = ({bottleId}: { bottleId: string }) => {
        return (
            <Menu.Item
                leftSection={<IconEdit/>}
                onClick={() => Router.push(`/bottles/${bottleId}/edit`)}
            > Edit </Menu.Item>)
    }

    return (
        <Container>
            <Group justify={"space-between"}>
                <h1>
                    <ActionIcon
                        component={Link}
                        href={props.bottle.finished ? ("/bottles/history") : ("/bottles/")}
                        mr={5}
                    >
                        <IconCircleArrowLeft/>
                    </ActionIcon>
                    {props.bottle.product.brand.type == "WINE"
                        ? props.bottle.product.vintage
                        : null}{" "}
                    {props.bottle.product.name}
                </h1>
                <Group>
                    <Menu shadow="md" width={200}>
                        <Menu.Target>
                            <ActionIcon>
                                <IconDotsCircleHorizontal/>
                            </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                            {openEditBottle({bottleId: props.bottle.id || ""})}
                            {props.bottle.shelfItem && !props.bottle.finished ? (
                                openRemoveFromShelfModal({shelfItemId: props.bottle.shelfItem?.id || ""})
                            ) : null}
                            {!props.bottle.shelfItem && !props.bottle.finished ? (
                                openAddToShelfModal({bottleId: props.bottle.id || ""})
                            ) : null}
                            {!props.bottle.shelfItem && !props.bottle.finished ? (
                                openFinishModal({bottleId: props.bottle.id || ""})
                            ) : null}
                            {props.bottle.shelfItem ? null : (openDeleteModal({bottleId: props.bottle.id || ""}))}
                        </Menu.Dropdown>
                    </Menu>
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
