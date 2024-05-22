import {authOptions} from "pages/api/auth/[...nextauth]";
import {getSession, useSession} from "next-auth/react";
import {getServerSession} from "next-auth";
import type {Stash} from "@prisma/client";
import type {Session} from "inspector";
import {GetServerSideProps} from "next";
import prisma from "../../lib/prismadb";
import Link from "next/link";
import {Container, Grid, Image, Button, Group, Card, Text, Center} from "@mantine/core";

export const getServerSideProps: GetServerSideProps = async ({req, res}) => {
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

    const stashes = await prisma.stash.findMany({
        where: {
            userId: session?.user?.id,
        },
        include: {
            shelves: {
                include: {
                    shelfItems: true
                },
            }
        },
    });
    return {
        props: {stashes},
    };
};

type Props = {
    stashes: Stash[];
};

const Stashes: React.FC<Props> = (props) => {
    return (
        <Container>
            <Group justify="space-between" h="100%" pl="10px" pt="10px">
                <h1>My Stashes</h1>

                <Link href="/stashes/create">
                    <Button>Create Stash</Button>
                </Link>
            </Group>

            <Grid>
                {props.stashes.map((stash) => (
                    <Grid.Col span={{base: 12, xs: 4}} key={stash.id}>
                        <Card>
                            <Card.Section
                                style={{backgroundColor: "#f0f0f0", padding:"10px"}}
                            >
                                <Center>
                                <Text fw={500}>{stash.name}</Text>
                                </Center>
                            </Card.Section>
                            <Card.Section>
                                <Button component={Link} href={`/stashes/${stash.id}`} fullWidth>
                                    View Stash
                                </Button>
                            </Card.Section>
                        </Card>
                    </Grid.Col>
                ))}
            </Grid>
        </Container>
    );
};

export default Stashes;
