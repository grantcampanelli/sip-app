import { authOptions } from "pages/api/auth/[...nextauth]";
import { getSession, useSession } from "next-auth/react";
import { getServerSession } from "next-auth";
import { Stash, Shelf, ShelfItem, Bottle, Prisma } from "@prisma/client";
import type { Session } from "inspector";
import { GetServerSideProps } from "next";
import prisma from "lib/prismadb";
import Link from "next/link";
import { Container, Button, Grid, Group, Divider, Table } from "@mantine/core";
import { rem } from "@mantine/core";
// import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useListState } from "@mantine/hooks";
import { IconGripVertical } from "@tabler/icons-react";
import classes from "/styles/DndTableHandle.module.css";

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
    console.log("shelfItems props:", props);
    const [state, handlers] = useListState(props.shelf.shelfItems);

    const items = state.map((item, index) => (
        <Draggable key={item.id} index={index} draggableId={item.id}>
            {(provided) => (
                <Table.Tr
                    className={classes.item}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                >
                    <Table.Td>
                        <div
                            className={classes.dragHandleTable}
                            {...provided.dragHandleProps}
                        >
                            <IconGripVertical
                                style={{ width: rem(18), height: rem(18) }}
                                stroke={1.5}
                            />
                        </div>
                    </Table.Td>
                    <Table.Td>{item.bottle.product.name}</Table.Td>
                    <Table.Td>
                        {item.bottle.purchaseDate
                            ? item.bottle.purchaseDate.toLocaleDateString()
                            : null}
                    </Table.Td>
                    <Table.Td>
                        <Link href={`/bottles/${item.bottle.id}`}>View</Link>
                    </Table.Td>
                </Table.Tr>
            )}
        </Draggable>
    ));

    return (
        <Container>
            <Group justify="space-between" h="100%" pl="10px" pt="10px">
                <h1>Shelf {props.shelf.order}</h1>

                <Link
                    href={`/shelves/${props.shelf.id}/addBottle`}
                    style={{ textDecoration: "none" }}
                >
                    <Button>Add Bottle</Button>
                </Link>
            </Group>

            <Table.ScrollContainer minWidth={420}>
                <DragDropContext
                    onDragEnd={({ destination, source }) =>
                        handlers.reorder({
                            from: source.index,
                            to: destination?.index || 0,
                        })
                    }
                >
                    <Table>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th />
                                <Table.Th> Name</Table.Th>
                                <Table.Th>Purchase Date</Table.Th>
                                <Table.Th>View</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Droppable droppableId="dnd-list" direction="vertical">
                            {(provided) => (
                                <Table.Tbody
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                >
                                    {items}
                                    {provided.placeholder}
                                </Table.Tbody>
                            )}
                        </Droppable>
                    </Table>
                </DragDropContext>
            </Table.ScrollContainer>
        </Container>
    );
};

export default ShelfItems;
