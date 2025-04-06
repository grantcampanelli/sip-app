import {authOptions} from "pages/api/auth/[...nextauth]";
import {getServerSession} from "next-auth";
import {Stash, Prisma} from "@prisma/client";
import {GetServerSideProps} from "next";
import prisma from "lib/prismadb";
import Link from "next/link";
import Router from "next/router";
import {
    ActionIcon, 
    Card, 
    Divider, 
    Menu, 
    rem, 
    Text, 
    Progress, 
    SimpleGrid,
    Badge,
    Paper,
    Stack,
    RingProgress,
    useMantineTheme,
    Title
} from "@mantine/core";

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
                bottle: {
                    include: {
                        product: {
                            include: {
                                brand: true;
                            }
                        }
                    }
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
                        bottle: {
                            include: {
                                product: {
                                    include: {
                                        brand: true
                                    }
                                }
                            }
                        },
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
    const theme = useMantineTheme();
    const form = useForm({
        initialValues: {
            name: "",
            order: 0,
            capacity: 0,
            temp: 0.0,
            stashId: "",
        },
    });
    
    // Calculate summary statistics
    const totalCapacity = props.shelves.reduce((sum, shelf) => sum + shelf.capacity, 0);
    const totalBottles = props.shelves.reduce((sum, shelf) => sum + shelf.shelfItems.length, 0);
    const occupancyPercentage = totalCapacity > 0 ? (totalBottles / totalCapacity) * 100 : 0;
    
    // Group bottles by varietal instead of type
    const bottlesByVarietal = props.shelves.flatMap(shelf => shelf.shelfItems)
        .reduce((acc, item) => {
            const varietal = item.bottle?.product?.varietal || 'Unknown';
            acc[varietal] = (acc[varietal] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
    
    const varietals = Object.keys(bottlesByVarietal).sort((a, b) => bottlesByVarietal[b] - bottlesByVarietal[a]);
    
    // Group bottles by brand
    const bottlesByBrand = props.shelves.flatMap(shelf => shelf.shelfItems)
        .reduce((acc, item) => {
            const brandName = item.bottle?.product?.brand?.name || 'Unknown';
            acc[brandName] = (acc[brandName] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
    
    const brands = Object.keys(bottlesByBrand).sort((a, b) => bottlesByBrand[b] - bottlesByBrand[a]);
    
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

            {/* Stash Summary Dashboard */}
            <Card shadow="sm" padding="lg" radius="md" withBorder mb={20}>
                <Card.Section withBorder inheritPadding py="xs">
                    <Title order={3}>Stash Summary</Title>
                </Card.Section>
                
                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg" my="md">
                    <Paper withBorder p="md" radius="md">
                        <Text ta="center" fz="lg" fw={700}>Inventory Status</Text>
                        <RingProgress
                            sections={[{ value: occupancyPercentage, color: occupancyPercentage > 80 ? 'red' : 'blue' }]}
                            label={
                                <Text ta="center" fz="xl" fw={700}>
                                    {Math.round(occupancyPercentage)}%
                                </Text>
                            }
                            size={120}
                            thickness={12}
                            mx="auto"
                            my="md"
                        />
                        <Text ta="center" c="dimmed" fz="sm">
                            {totalBottles} of {totalCapacity} bottles
                        </Text>
                    </Paper>
                    
                    <Paper withBorder p="md" radius="md">
                        <Text ta="center" fz="lg" fw={700}>Varietals</Text>
                        <Stack gap="xs" my="md">
                            {varietals.slice(0, 5).map(varietal => (
                                <Group key={varietal} justify="space-between">
                                    <Text>{varietal}</Text>
                                    <Badge size="lg">{bottlesByVarietal[varietal]}</Badge>
                                </Group>
                            ))}
                            {varietals.length > 5 && (
                                <Text c="dimmed" ta="center" size="xs">+{varietals.length - 5} more varietals</Text>
                            )}
                            {varietals.length === 0 && (
                                <Text c="dimmed" ta="center">No varietals available</Text>
                            )}
                        </Stack>
                    </Paper>
                    
                    <Paper withBorder p="md" radius="md">
                        <Text ta="center" fz="lg" fw={700}>Top Brands</Text>
                        <Stack gap="xs" my="md">
                            {brands.slice(0, 5).map(brand => (
                                <Group key={brand} justify="space-between">
                                    <Text>{brand}</Text>
                                    <Badge size="lg">{bottlesByBrand[brand]}</Badge>
                                </Group>
                            ))}
                            {brands.length > 5 && (
                                <Text c="dimmed" ta="center" size="xs">+{brands.length - 5} more brands</Text>
                            )}
                            {brands.length === 0 && (
                                <Text c="dimmed" ta="center">No brands available</Text>
                            )}
                        </Stack>
                    </Paper>
                </SimpleGrid>
            </Card>

            {/* Enhanced Shelf Cards */}
            {props.shelves.map((row) => (
                <Card
                    key={row.id}
                    shadow="sm"
                    radius="md"
                    pt={20}
                    mt={5}
                    withBorder>
                    <Card.Section withBorder>
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
                    
                    {row.shelfItems.length > 0 && (
                        <Card.Section p="sm">
                            <Progress 
                                value={(row.shelfItems.length / row.capacity) * 100} 
                                color={row.shelfItems.length / row.capacity > 0.8 ? "red" : "blue"} 
                                size="lg"
                                mb="xs"
                            />
                            
                            <SimpleGrid cols={{ base: 2, sm: 3, md: 5 }} spacing={5}>
                                {row.shelfItems.slice(0, 5).map((item, index) => (
                                    <Link 
                                        key={index} 
                                        href={`/bottles/${item.bottle?.id}`}
                                        style={{ textDecoration: 'none' }}
                                    >
                                        <Paper 
                                            p="xs" 
                                            withBorder
                                            styles={(theme) => ({
                                                root: {
                                                    cursor: 'pointer',
                                                    '&:hover': {
                                                        backgroundColor: theme.colors.gray[1],
                                                        boxShadow: theme.shadows.sm,
                                                    }
                                                }
                                            })}
                                        >
                                            <Text size="xs" fw={500} truncate>
                                                {item.bottle?.product?.brand?.name 
                                                    ? `${item.bottle.product.brand.name} ${item.bottle.product.name} ${item.bottle.product.vintage || ''}`.trim()
                                                    : ('Unnamed bottle')}
                                            </Text>
                                        </Paper>
                                    </Link>
                                ))}
                                {row.shelfItems.length > 5 && (
                                    <Badge size="lg">+{row.shelfItems.length - 5} more</Badge>
                                )}
                            </SimpleGrid>
                        </Card.Section>
                    )}
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

