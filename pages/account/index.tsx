import {authOptions} from "pages/api/auth/[...nextauth]";
import {getServerSession} from "next-auth";
import {GetServerSideProps} from "next";
import prisma from "../../lib/prismadb";
import {Bottle, User, Prisma, UserPayload} from "@prisma/client";
import { useSession, signIn, signOut } from "next-auth/react";

import {
    Container,
    Group,
    Button,
    Card,
    Text,
    TextInput,
    rem,
    keys, ActionIcon, Tooltip, Menu
} from "@mantine/core";



type UserWithFullData = Prisma.UserGetPayload<any>;

export const getServerSideProps: GetServerSideProps = async ({
                                                                 req,
                                                                 res,
                                                                 query,
                                                             }) => {
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
    let userId: string = session.user.id;
    let user: User | null = null;
    user =
        (await prisma.user.findUnique({
            where: {
                id: userId,
            },
        })) || null;

    return {
        props: {user}
    };
};

type Props = {
    user: User;
    // bottles: BottleWithFullData[];
    // bottleFlatRowData: BottleFlatRow[];
};

const Account: React.FC<Props> = (props) => {

    return (
        <Container>
            <Group justify="space-between" h="100%" pl="10px" pt="10px">
                <Group>
                    <h1>User</h1>
                    <h1>{props.user.email}</h1>
                    <Button onClick={() => signOut()}>Log Out</Button>

                </Group>
            </Group>
        </Container>
    );
};

export default Account;
