import {authOptions} from "pages/api/auth/[...nextauth]";
import {getServerSession} from "next-auth";
import {Stash, Prisma} from "@prisma/client";
import {GetServerSideProps} from "next";
import prisma from "lib/prismadb";
import Link from "next/link";
import Router from "next/router";
import {ActionIcon, Card, Divider, Menu, rem, Text} from "@mantine/core";


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
import {useDisclosure} from "@mantine/hooks";
import {useForm} from "@mantine/form";
import {useState} from "react";
import {IconCircleArrowLeft, IconDotsCircleHorizontal, IconSquarePlus} from "@tabler/icons-react";
import {modals} from "@mantine/modals";


type ShelfWithFullData = Prisma.ShelfGetPayload<{
    include: {
        shelfItems: {
            include: {
                bottle: true;
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

    let stashId: string = Array.isArray(query.id) ? "" : query.id || "";
    if (!session) {
        res.statusCode = 403;

        return {
            redirect: {
                destination: "/",
                permanent: false,
            },
        };
    }
    let stash: Stash | null = null;
    stash =
        (await prisma.stash.findUnique({
            where: {
                id: stashId,
            }
        })) || null;


    let shelves : ShelfWithFullData[] | null = null;
    shelves =
        (await prisma.shelf.findMany({
            where: {
                stashId: stashId,
            },
            orderBy: {
                name: 'asc',
            },
            include: {
                shelfItems: {
                    include: {
                        bottle: true,
                    },
                },
            },
        })) || null;
    return {
        props: {
            stash, shelves
        },
    };
};

type Props = {
    stash: Stash;
    shelves: ShelfWithFullData[];
};

const Stashes: React.FC<Props> = (props) => {
    const [opened, {open, close}] = useDisclosure(false);
    const form = useForm({
        initialValues: {
            name: "",
            order: 0,
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
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(body),
            });
            Router.reload();

        } catch (error) {
            console.error(error);
        }
    };



    return (
        <Container>
            <Group justify="space-between" >
                <Group>
                <ActionIcon
                    component={Link}
                    href={`/stashes/`}
                    mr={5}
                    size={"lg"}
                >
                    <IconCircleArrowLeft/>
                </ActionIcon>
                <h1>{props.stash.name}</h1>
                </Group>
                <Group>
                    <Menu shadow="md">
                        <Menu.Target>
                            <ActionIcon
                            size="lg"
                            >
                                <IconDotsCircleHorizontal/>
                            </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                            <Menu.Item leftSection={<IconSquarePlus/>} onClick={open}> Add Shelf</Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </Group>
            </Group>

            {props.shelves

                .map((row) => (

                    <Card
                        key={row.id}
                        shadow="sm"
                        // padding="md"
                        radius="md"
                        pt={20}
                        mt={5}
                        withBorder>
                        <Card.Section>
                            <Link
                                style={{textDecoration: "none"}}
                                href={`/shelves/${row.id}`}
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
                                    {row.name}
                                </Text>
                                <Text
                                    size="sm"
                                    fw={800}
                                    ta="left"
                                    pl={20}
                                    pr={20}
                                    variant="gradient"
                                    gradient={{from: "red", to: "maroon", deg: 90}}>
                                    Current Inventory: {row.shelfItems.length}/{row.capacity}
                                </Text>
                            </Link>
                        </Card.Section>
                    </Card>
                ))}

            <Modal opened={opened} onClose={close} title="Create Shelf">
                <Box maw={340} mx="auto">
                    <form onSubmit={form.onSubmit((values) => console.log(values))}>
                        <TextInput
                            withAsterisk
                            label="Name"
                            placeholder="1st Shelf"
                            {...form.getInputProps("name")}
                        />
                        {/*<NumberInput*/}
                        {/*    withAsterisk*/}
                        {/*    label="Order"*/}
                        {/*    placeholder="1"*/}
                        {/*    {...form.getInputProps("order")}*/}
                        {/*/>*/}
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
                </Box>
            </Modal>
        </Container>
    );
};

export default Stashes;
