import { authOptions } from "pages/api/auth/[...nextauth]";
import { getSession, useSession } from "next-auth/react";
import { getServerSession } from "next-auth";
import { Stash, Shelf, ShelfItem, Bottle, Prisma } from "@prisma/client";
import type { Session } from "inspector";
import { GetServerSideProps } from "next";
import prisma from "lib/prismadb";
import Link from "next/link";
import {
    Container,
    Button,
    Grid,
    Group,
    Divider,
    Table,
    NumberInput,
    TextInput,
    ActionIcon,
    Menu,
    Card, Text, Modal, Box
} from "@mantine/core";
import { rem } from "@mantine/core";
// import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {useDisclosure, useListState} from "@mantine/hooks";
import {IconCircleArrowLeft, IconDotsCircleHorizontal, IconGripVertical, IconSquarePlus} from "@tabler/icons-react";
import classes from "/styles/DndTableHandle.module.css";
import {useForm} from "@mantine/form";
import Router from "next/router";
import {DateTimePicker} from "@mantine/dates";
import React from "react";

type ShelfWithItems = Prisma.ShelfGetPayload<{
    include: {
        shelfItems: true
    };
}>;

export const getServerSideProps: GetServerSideProps = async ({
                                                                 req,
                                                                 res,
                                                                 query,
                                                             }) => {
    const session = await getServerSession(req, res, authOptions);
    let shelfId: string = Array.isArray(query.id) ? "" : query.id || "";
    console.log("we are querying")
    console.log("shelfId: ", shelfId)
    if (!session) {
        res.statusCode = 403;

        return {
            redirect: {
                destination: "/",
                permanent: false,
            },
        };
    }
    let shelf: ShelfWithItems | null = null;
    shelf =
        (await prisma.shelf.findUnique({
            where: {
                id: shelfId,
            },
            include: {
                shelfItems: true,
            },
        })) || null;

    return {
        props: {
            shelf,
        },
    };
};

type Props = {
    shelf: ShelfWithItems;
};

const ShelfEdit:React.FC<Props> = (props) => {
        const [opened, {open, close}] = useDisclosure(false);
        const form = useForm({
            initialValues: {
                id: props.shelf.id,
                name: props.shelf.name,
                order: props.shelf.order,
                capacity: props.shelf.capacity,
                temp: props.shelf.temp,
                stashId: props.shelf.stashId,
            },
        });
        const submitData = async (e: React.SyntheticEvent) => {
            e.preventDefault();

            try {
                const body = {
                    id: props.shelf.id,
                    name: form.values.name,
                    order: form.values.order,
                    capacity: form.values.capacity,
                    temp: form.values.temp,
                    stashId: form.values.stashId,
                };
                console.log("trying to PUT")
                await fetch(`/api/shelves/${props.shelf.id}`, {
                    method: "PUT",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify(body),
                })
                    .then((res) => {
                    if (res.ok) {
                        Router.push(`/shelves/${props.shelf.id}`);
                    }
                })
                ;
            } catch (error) {
                console.error(error);
            }
        };

    return (
        <Container>
            <Group justify="space-between" >
                    <h1>{props.shelf.name}</h1>
            </Group>

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
                            placeholder="55"
                            {...form.getInputProps("temp")}
                        />
                        <Group justify="flex-end" mt="md">
                            <Button type="submit" onClick={submitData}>
                                Submit
                            </Button>
                        </Group>
                    </form>

        </Container>
    );
    };


export default ShelfEdit;
