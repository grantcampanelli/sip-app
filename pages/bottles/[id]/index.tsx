import {authOptions} from "pages/api/auth/[...nextauth]";
import {getServerSession} from "next-auth";
import {Bottle, Prisma} from "@prisma/client";
import {GetServerSideProps} from "next";
import prisma from "../../../lib/prismadb";
import Link from "next/link";
import Router from "next/router";
import {modals} from "@mantine/modals";
import { useState } from 'react'


import {
    Container,
    Group,
    Text,
    ActionIcon,
    Menu,
    Title, Button,
    Paper,
    Loader,
    Box
} from "@mantine/core";
import {
    IconTrash,
    IconEdit,
    IconCheckbox,
    IconSquarePlus,
    IconSquareX,
    IconDotsCircleHorizontal,
    IconRobot
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
        })
        ) || null;

    return {
        props: {
            bottle
        },
    };
};

type Props = {
    bottle: BottleWithFullData;
    chatData: String;
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

    const [data, setData] = useState(null)
    const [isLoading, setLoading] = useState(false)
    const [hasRequested, setHasRequested] = useState(false)

    // Create an improved prompt that gets better details about the bottle
    const getImprovedPrompt = () => {
        const { bottle } = props;
        const isWine = bottle.product.brand.type === "WINE";
        
        let prompt = `Provide a detailed description of ${bottle.product.brand.name} ${bottle.product.name}`;
        
        if (isWine && bottle.product.vintage) {
            prompt += ` ${bottle.product.vintage} vintage`;
        }
        
        prompt += `. Include information about:
- Flavor profile and tasting notes
- ${isWine ? 'Winery background and region characteristics' : 'Distillery background and production methods'}
- Ideal serving suggestions and food pairings
- ${isWine ? 'Aging potential and peak drinking window' : 'Best way to enjoy this spirit'}
- What makes this bottle special or unique
Please format this as a helpful description for a wine collector.`;
        
        return prompt;
    }

    // Function to fetch ChatGPT description when button is clicked
    const fetchBottleDescription = () => {
        setLoading(true);
        setHasRequested(true);
        
        fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ promptInput: getImprovedPrompt() }),
        })
        .then((res) => res.json())
        .then((data) => {
            setData(data);
            setLoading(false);
        })
        .catch(error => {
            console.error("Error fetching bottle description:", error);
            setLoading(false);
        });
    }

    return (
        <Box py="xl">
            <Container size="lg">
                <Group justify={"space-between"}>
                    <Title>
                        {props.bottle.product.brand.name} {props.bottle.product.name} {props.bottle.product.brand.type == "WINE"
                        ? props.bottle.product.vintage
                        : null}{" "}
                    </Title>
                    <Group>
                        <Menu shadow="md" width={200}>
                            <Menu.Target>
                                <ActionIcon size={"lg"}>
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
                
                <Paper withBorder p="md" mt="md">
                    <Group mb="sm">
                        <Text size="lg" fw={600}>Bottle Description</Text>
                        {!hasRequested && (
                            <Button 
                                leftSection={<IconRobot size={16} />}
                                onClick={fetchBottleDescription} 
                                variant="light" 
                                color="blue"
                            >
                                Get AI Description
                            </Button>
                        )}
                    </Group>
                    
                    {!hasRequested ? (
                        <Text color="dimmed">Click the button to get a detailed AI description of this bottle.</Text>
                    ) : isLoading ? (
                        <Group>
                            <Loader size="sm" />
                            <Text>Generating description...</Text>
                        </Group>
                    ) : (
                        <Text>{data}</Text>
                    )}
                </Paper>
            </Container>
        </Box>
    );
};

export default BottlePage;

