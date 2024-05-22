import { authOptions } from "pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import { GetServerSideProps } from "next";
import prisma from "../../../lib/prismadb";
import { Prisma } from "@prisma/client";

// next imports
import Link from "next/link";

// mantine imports
import {Container, Button, Grid, Group, Card, Text, ActionIcon} from "@mantine/core";
import {IconCircleArrowLeft} from "@tabler/icons-react";

type BottleWithFullData = Prisma.BottleGetPayload<{
    include: {
        product: {
            include: {
                brand: true;
            };
        };
    };
}>;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
        res.statusCode = 403;
        return {
            redirect: {
                destination: "/",
                permanent: false,
            },
        };
    }

    const bottles: BottleWithFullData[] = await prisma.bottle.findMany({
        where: {
            userId: session?.user?.id,
        },
        include: {
            product: {
                include: {
                    brand: true,
                },
            },
        },
    });

    return {
        props: { bottles },
    };
};

type Props = {
    bottles: BottleWithFullData[];
};

const Bottles: React.FC<Props> = (props) => {
    return (
        <Container>
                <Group justify={"flex-start"}>
                    <ActionIcon
                        component={Link}
                        href={"/bottles/"}
                        mr={5}
                    >
                        <IconCircleArrowLeft/>
                    </ActionIcon>
                    <h1>Finished Bottles</h1>
                </Group>
                {/*<Group>*/}
                {/*    <Link href="/bottles">*/}
                {/*        <Button>Unfinished Bottles</Button>*/}
                {/*    </Link>*/}
                {/*</Group>*/}


            {/*<Grid>*/}
            {/*    {props.bottles*/}
            {/*        .filter(function (bottle) {*/}
            {/*            return bottle.finished != true;*/}
            {/*        })*/}
            {/*        .map((bottle) => (*/}
            {/*            <Grid.Col span={{ base: 12, xs: 4 }} key={bottle.id}>*/}
            {/*                <Link*/}
            {/*                    style={{ textDecoration: "none" }}*/}
            {/*                    href={`/bottles/${bottle.id}`}*/}
            {/*                >*/}
            {/*                    <Button fullWidth>*/}
            {/*                        {bottle.product.brand.name} {bottle.product.name}{" "}*/}
            {/*                        {bottle.product.vintage}*/}
            {/*                    </Button>*/}
            {/*                </Link>*/}
            {/*            </Grid.Col>*/}
            {/*        ))}*/}
            {/*</Grid>*/}

            <Container>
                {props.bottles
                    .filter(function (bottle) {
                        return bottle.finished == true;
                    })
                    .map((bottle) => (
                        <Card
                            key={bottle.id}
                            shadow="sm"
                            padding="md"
                            radius="md"
                            pt={20}
                            mt={5}


                            // component={"a"}
                            // href={"/bottles/"+bottle.id}
                            withBorder
                        >
                            <Card.Section>
                                <Link
                                    style={{ textDecoration: "none" }}
                                    href={`/bottles/${bottle.id}`}
                                >
                                    <Text
                                        size="lg"
                                        fw={800}
                                        ta="left"
                                        pl={20}
                                        pr={20}
                                        variant="gradient"
                                        gradient={{ from: "red", to: "maroon", deg: 90 }}

                                    >
                                        {bottle.product.brand.name} {bottle.product.name} {bottle.product.vintage}
                                    </Text>
                                    <Text
                                        size="sm"
                                        fw={800}
                                        ta="left"
                                        pl={20}
                                        pr={20}
                                        variant="gradient"
                                        gradient={{ from: "red", to: "maroon", deg: 90 }}>
                                        Purchase Date: {bottle.purchaseDate?.toLocaleDateString()}
                                    </Text>
                                </Link>
                            </Card.Section>
                        </Card>

                    ))}
            </Container>
            {/*<Grid>*/}
            {/*  {props.bottles*/}
            {/*    .filter(function (bottle) {*/}
            {/*      return bottle.finished == true;*/}
            {/*    })*/}
            {/*    .map((bottle) => (*/}
            {/*      <Grid.Col span={{ base: 12, xs: 4 }} key={bottle.id}>*/}
            {/*        <Link*/}
            {/*          style={{ textDecoration: "none" }}*/}
            {/*          href={`/bottles/${bottle.id}`}*/}
            {/*        >*/}
            {/*          <Button fullWidth>*/}
            {/*            {bottle.product.brand.name} {bottle.product.name}{" "}*/}
            {/*            {bottle.product.vintage}*/}
            {/*          </Button>*/}
            {/*        </Link>*/}
            {/*      </Grid.Col>*/}
            {/*    ))}*/}
            {/*</Grid>*/}
        </Container>
    );
};

export default Bottles;
