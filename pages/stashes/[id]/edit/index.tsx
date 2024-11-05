import { authOptions } from "pages/api/auth/[...nextauth]";
import { getSession, useSession } from "next-auth/react";
import { getServerSession } from "next-auth";
import { Stash, Shelf, ShelfItem, Bottle, Prisma } from "@prisma/client";
import type { Session } from "inspector";
import { GetServerSideProps } from "next";
import prisma from "lib/prismadb";
import Link from "next/link";
import Router from "next/router";
import { Divider, rem, Text } from "@mantine/core";
import { useListState } from "@mantine/hooks";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { IconGripVertical } from "@tabler/icons-react";
import classes from "/styles/DndTableHandle.module.css";

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
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";

type StashWithFullData = Prisma.StashGetPayload<{
    include: {
        shelves: {
            include: {
                shelfItems: {
                    include: {
                        bottle: true;
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
    //   const session = await getSession({ req });

    let stashId: string = Array.isArray(query.id) ? "" : query.id || "";
    if (!session) {
        res.statusCode = 403;

        //return { props: { stashes: [] } };
        return {
            redirect: {
                destination: "/",
                permanent: false,
            },
        };
    }
    let stash: StashWithFullData | null = null;
    stash =
        (await prisma.stash.findUnique({
            where: {
                id: stashId,
            },
            include: {
                shelves: {
                    include: {
                        shelfItems: {
                            include: {
                                bottle: true,
                            },
                        },
                    },
                },
            },
        })) || null;

    return {
        props: {
            stash,
        },
    };
};

type Props = {
    stash: StashWithFullData;
};

const Stashes: React.FC<Props> = (props) => {
    const [opened, { open, close }] = useDisclosure(false);
    const form = useForm({
        initialValues: {
            name: "",
            order: "",
            capacity: 0,
            temp: 0.0,
            stashId: "",
        },
    });
    const submitData = async (e: React.SyntheticEvent) => {
        e.preventDefault();

        try {
            const body = {
                name: form.values.name,
                order: form.values.order,
                capacity: form.values.capacity,
                temp: form.values.temp,
                stashId: props.stash.id,
            };
            await fetch("/api/shelves", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            // const url = "/stashes/" + props.stash.id;
            // await Router.push(url);
            // close();
            Router.reload();

        } catch (error) {
            console.error(error);
        }
    };

    const [state, handlers] = useListState(props.stash.shelves);

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
                    <Table.Td style={{ width: rem(40) }}>{item.name} </Table.Td>
                    <Table.Td style={{ width: rem(40) }}>{item.capacity}</Table.Td>
                    <Table.Td style={{ width: rem(40) }}>
                        {item.shelfItems.length}
                    </Table.Td>
                    <Table.Td style={{ width: rem(40) }}>
                        <Link
                            key={item.id}
                            style={{ textDecoration: "none" }}
                            href={`/shelves/${item.id}`}
                        >
                            <Button>Open</Button>
                        </Link>
                    </Table.Td>
                </Table.Tr>
            )}
        </Draggable>
    ));

    return (
        <Container>
            <Group justify="space-between" h="100%" pl="10px" pt="10px">
                <h1>{props.stash.name}</h1>

                <Button onClick={open}>Create Shelf</Button>
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
                                <Table.Th style={{ width: rem(40) }} />
                                <Table.Th style={{ width: rem(40) }}>Name</Table.Th>
                                <Table.Th style={{ width: rem(40) }}>Capacity</Table.Th>
                                <Table.Th style={{ width: rem(40) }}>Contains</Table.Th>
                                <Table.Th style={{ width: rem(40) }}>Open</Table.Th>
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

            <Modal opened={opened} onClose={close} title="Create Shelf">
                <Box maw={340} mx="auto">
                    <form onSubmit={form.onSubmit((values) => console.log(values))}>
                        <TextInput
                            withAsterisk
                            label="Name"
                            placeholder="1st Shelf"
                            {...form.getInputProps("name")}
                        />
                        <NumberInput
                            withAsterisk
                            label="Order"
                            placeholder="1"
                            {...form.getInputProps("order")}
                        />
                        <NumberInput
                            withAsterisk
                            label="Capacity"
                            placeholder="5"
                            {...form.getInputProps("capacity")}
                        />
                        <NumberInput
                            withAsterisk
                            label="Temperature"
                            placeholder="5"
                            {...form.getInputProps("temp")}
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

export default Stashes;
